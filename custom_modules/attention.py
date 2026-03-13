"""
Custom Attention Modules for CA-YOLOv8
=======================================
CBAM (Convolutional Block Attention Module) and Coordinate Attention
for enhanced ID card detection.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F


# ---------------------------------------------------------------------------
# CBAM: Convolutional Block Attention Module (Woo et al., ECCV 2018)
# ---------------------------------------------------------------------------

class ChannelAttention(nn.Module):
    """Channel attention sub-module of CBAM.
    Learns inter-channel feature relationships using shared MLPs on
    both average-pooled and max-pooled features.
    """

    def __init__(self, channels, reduction=16):
        super().__init__()
        mid = max(channels // reduction, 8)
        self.avg_pool = nn.AdaptiveAvgPool2d(1)
        self.max_pool = nn.AdaptiveMaxPool2d(1)
        self.fc = nn.Sequential(
            nn.Conv2d(channels, mid, 1, bias=False),
            nn.ReLU(inplace=True),
            nn.Conv2d(mid, channels, 1, bias=False),
        )
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        avg_out = self.fc(self.avg_pool(x))
        max_out = self.fc(self.max_pool(x))
        return x * self.sigmoid(avg_out + max_out)


class SpatialAttention(nn.Module):
    """Spatial attention sub-module of CBAM.
    Learns inter-spatial feature relationships using channel-wise
    average and max pooling followed by a convolution.
    """

    def __init__(self, kernel_size=7):
        super().__init__()
        padding = kernel_size // 2
        self.conv = nn.Conv2d(2, 1, kernel_size, padding=padding, bias=False)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        avg_out = torch.mean(x, dim=1, keepdim=True)
        max_out, _ = torch.max(x, dim=1, keepdim=True)
        combined = torch.cat([avg_out, max_out], dim=1)
        return x * self.sigmoid(self.conv(combined))


class CBAM(nn.Module):
    """CBAM: Convolutional Block Attention Module.

    Sequentially applies channel attention and spatial attention.
    Designed to be compatible with ultralytics YAML config.

    Args:
        c1 (int): Input channels (auto-set by ultralytics parse_model).
        kernel_size (int): Spatial attention conv kernel size.
        reduction (int): Channel attention reduction ratio.
    """

    def __init__(self, c1, kernel_size=7, reduction=16):
        super().__init__()
        self.channel_attention = ChannelAttention(c1, reduction)
        self.spatial_attention = SpatialAttention(kernel_size)

    def forward(self, x):
        x = self.channel_attention(x)
        x = self.spatial_attention(x)
        return x


# ---------------------------------------------------------------------------
# Coordinate Attention (Hou et al., CVPR 2021)
# ---------------------------------------------------------------------------

class CoordAtt(nn.Module):
    """Coordinate Attention Module.

    Decomposes channel attention into two 1D feature encoding processes
    that capture long-range dependencies along horizontal and vertical
    directions respectively. This preserves precise positional information.

    Args:
        c1 (int): Input channels (auto-set by ultralytics parse_model).
        c2 (int): Output channels (auto-set, typically same as c1).
        reduction (int): Reduction ratio for intermediate channels.
    """

    def __init__(self, c1, c2=None, reduction=32):
        super().__init__()
        c2 = c2 or c1
        mid = max(8, c1 // reduction)

        self.pool_h = nn.AdaptiveAvgPool2d((None, 1))
        self.pool_w = nn.AdaptiveAvgPool2d((1, None))

        self.conv1 = nn.Conv2d(c1, mid, 1, bias=False)
        self.bn1 = nn.BatchNorm2d(mid)
        self.act = nn.SiLU(inplace=True)

        self.conv_h = nn.Conv2d(mid, c2, 1, bias=False)
        self.conv_w = nn.Conv2d(mid, c2, 1, bias=False)

    def forward(self, x):
        identity = x
        n, c, h, w = x.size()

        # Encode horizontal and vertical positional information
        x_h = self.pool_h(x)           # (n, c, h, 1)
        x_w = self.pool_w(x).permute(0, 1, 3, 2)  # (n, c, w, 1) -> (n, c, w, 1)

        # Concatenate along spatial dimension
        y = torch.cat([x_h, x_w], dim=2)  # (n, c, h+w, 1)
        y = self.act(self.bn1(self.conv1(y)))

        # Split back to h and w
        x_h, x_w = torch.split(y, [h, w], dim=2)
        x_w = x_w.permute(0, 1, 3, 2)

        # Generate attention maps
        a_h = self.conv_h(x_h).sigmoid()
        a_w = self.conv_w(x_w).sigmoid()

        return identity * a_h * a_w


# ---------------------------------------------------------------------------
# EMA: Efficient Multi-Scale Attention (Optional enhancement)
# ---------------------------------------------------------------------------

class EMA(nn.Module):
    """Efficient Multi-Scale Attention module.

    Uses parallel multi-scale attention branches for richer feature
    representation. Particularly effective for objects at varying scales
    (persons are large, ID cards are small).

    Args:
        c1 (int): Input channels.
        factor (int): Group factor for multi-scale processing.
    """

    def __init__(self, c1, factor=32):
        super().__init__()
        self.groups = max(1, c1 // factor)
        assert c1 // self.groups > 0
        self.softmax = nn.Softmax(dim=-1)
        self.avg_pool_h = nn.AdaptiveAvgPool2d((None, 1))
        self.avg_pool_w = nn.AdaptiveAvgPool2d((1, None))
        self.gn = nn.GroupNorm(self.groups, c1)
        self.conv1x1 = nn.Conv2d(c1, c1, 1, bias=False)
        self.conv3x3 = nn.Conv2d(c1, c1, 3, padding=1, bias=False)

    def forward(self, x):
        b, c, h, w = x.size()
        group_x = x.reshape(b * self.groups, -1, h, w)

        # Horizontal and vertical pooling
        x_h = self.avg_pool_h(group_x)
        x_w = self.avg_pool_w(group_x).permute(0, 1, 3, 2)

        # Generate weights
        hw = self.conv1x1(torch.cat([x_h, x_w], dim=2).reshape(b, c, -1, 1))
        x_h, x_w = torch.split(hw.reshape(b * self.groups, -1, h + w, 1),
                                [h, w], dim=2)

        # Apply attention
        x1 = self.gn(group_x * x_h.sigmoid() * x_w.permute(0, 1, 3, 2).sigmoid())
        x2 = self.conv3x3(group_x)

        # Weighted combination
        x11 = self.softmax(self.avg_pool_h(x1).reshape(b * self.groups, -1, h) +
                           self.avg_pool_w(x1).reshape(b * self.groups, -1, w))
        x12 = x11.reshape(b * self.groups, -1, h, 1) * x11.reshape(b * self.groups, -1, 1, w)

        x21 = self.softmax(self.avg_pool_h(x2).reshape(b * self.groups, -1, h) +
                           self.avg_pool_w(x2).reshape(b * self.groups, -1, w))
        x22 = x21.reshape(b * self.groups, -1, h, 1) * x21.reshape(b * self.groups, -1, 1, w)

        weights = (x12 + x22).reshape(b * self.groups, -1, h, w)
        return (group_x * weights.sigmoid()).reshape(b, c, h, w)


# ---------------------------------------------------------------------------
# C2f_CBAM: C2f block with integrated CBAM attention
# ---------------------------------------------------------------------------

class C2f_CBAM(nn.Module):
    """C2f block enhanced with CBAM attention.

    This module integrates CBAM attention into the standard C2f block,
    applying attention after the cross-stage feature fusion. This is the
    core building block of our CA-YOLOv8 backbone.

    Args:
        c1 (int): Input channels.
        c2 (int): Output channels.
        n (int): Number of bottleneck blocks.
        shortcut (bool): Whether to use residual connections.
        g (int): Groups for grouped convolution.
        e (float): Expansion ratio.
    """

    def __init__(self, c1, c2, n=1, shortcut=False, g=1, e=0.5):
        super().__init__()
        from ultralytics.nn.modules.conv import Conv
        from ultralytics.nn.modules.block import Bottleneck

        self.c = int(c2 * e)
        self.cv1 = Conv(c1, 2 * self.c, 1, 1)
        self.cv2 = Conv((2 + n) * self.c, c2, 1)
        self.m = nn.ModuleList(
            Bottleneck(self.c, self.c, shortcut, g, k=((3, 3), (3, 3)), e=1.0)
            for _ in range(n)
        )
        self.attention = CBAM(c2)

    def forward(self, x):
        y = list(self.cv1(x).chunk(2, 1))
        y.extend(m(y[-1]) for m in self.m)
        out = self.cv2(torch.cat(y, 1))
        return self.attention(out)
