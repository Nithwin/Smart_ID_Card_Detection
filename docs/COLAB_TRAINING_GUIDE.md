# CA-YOLOv8 Complete Google Colab Training Guide
## Copy-paste each cell into Google Colab one by one

---

## CELL 1 — Check GPU & Install Dependencies

```python
# Check GPU availability
!nvidia-smi

# Install required packages
!pip install ultralytics==8.1.47 -q
!pip install roboflow -q
!pip install torch torchvision --upgrade -q

import torch
print(f"PyTorch: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")
print(f"GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'None'}")
```

---

## CELL 2 — Mount Google Drive

```python
from google.colab import drive
drive.mount('/content/drive')
```

---

## CELL 3 — Setup Project Directory

```python
import os

# Create project directory in Colab
PROJECT_DIR = '/content/CA_YOLOv8_ID_Detection'
os.makedirs(PROJECT_DIR, exist_ok=True)
os.chdir(PROJECT_DIR)
print(f"Working directory: {os.getcwd()}")

# Create subdirectories
os.makedirs('custom_modules', exist_ok=True)
os.makedirs('configs', exist_ok=True)
os.makedirs('runs', exist_ok=True)
```

---

## CELL 4 — Create Custom Attention Modules (CBAM + Coordinate Attention)

```python
%%writefile custom_modules/attention.py
"""
Custom Attention Modules for CA-YOLOv8
CBAM (Convolutional Block Attention Module) and Coordinate Attention
"""

import torch
import torch.nn as nn
import torch.nn.functional as F


# ==================== CBAM ====================

class ChannelAttention(nn.Module):
    """Channel Attention: learns WHICH feature channels are important.
    Uses both average-pooled and max-pooled features through a shared MLP.
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
    """Spatial Attention: learns WHERE to focus in the feature map.
    Uses channel-wise average and max pooling followed by a 7x7 convolution.
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
    """CBAM: Convolutional Block Attention Module (Woo et al., ECCV 2018)
    Sequentially applies Channel Attention then Spatial Attention.

    Args:
        c1 (int): Input channels.
        kernel_size (int): Spatial attention kernel size.
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


# ==================== Coordinate Attention ====================

class CoordAtt(nn.Module):
    """Coordinate Attention (Hou et al., CVPR 2021)
    Decomposes channel attention into two 1D encodings (horizontal + vertical)
    to preserve precise positional information.

    Args:
        c1 (int): Input channels.
        c2 (int): Output channels (default: same as c1).
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

        x_h = self.pool_h(x)
        x_w = self.pool_w(x).permute(0, 1, 3, 2)

        y = torch.cat([x_h, x_w], dim=2)
        y = self.act(self.bn1(self.conv1(y)))

        x_h, x_w = torch.split(y, [h, w], dim=2)
        x_w = x_w.permute(0, 1, 3, 2)

        a_h = self.conv_h(x_h).sigmoid()
        a_w = self.conv_w(x_w).sigmoid()

        return identity * a_h * a_w


# ==================== C2f_CBAM ====================

class C2f_CBAM(nn.Module):
    """C2f block with integrated CBAM attention at the end.

    Args:
        c1 (int): Input channels.
        c2 (int): Output channels.
        n (int): Number of bottleneck blocks.
        shortcut (bool): Use residual connections.
        g (int): Groups.
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
```

---

## CELL 5 — Create Module Registration

```python
%%writefile custom_modules/__init__.py
from custom_modules.attention import CBAM, CoordAtt, C2f_CBAM
```

---

## CELL 6 — Register Custom Modules with Ultralytics

```python
%%writefile custom_modules/register.py
"""Register custom modules with ultralytics so YAML configs can reference them."""

def register_custom_modules():
    from custom_modules.attention import CBAM, CoordAtt, C2f_CBAM
    import ultralytics.nn.modules as nn_modules
    from ultralytics.nn import tasks

    custom = {
        'CBAM': CBAM,
        'CoordAtt': CoordAtt,
        'C2f_CBAM': C2f_CBAM,
    }

    for name, cls in custom.items():
        setattr(nn_modules, name, cls)
        setattr(tasks, name, cls)

    print(f"[CA-YOLOv8] Registered custom modules: {list(custom.keys())}")
```

---

## CELL 7 — Create CA-YOLOv8 Architecture Config (3-Head)

```python
%%writefile configs/ca_yolov8.yaml
# CA-YOLOv8: Context-Aware YOLOv8 with CBAM + Coordinate Attention
# 3-head detection (P3, P4, P5)

nc: 2  # classes: card, person
scales:
  m: [0.67, 0.75, 768]  # YOLOv8m

backbone:
  - [-1, 1, Conv, [64, 3, 2]]        # 0-P1/2
  - [-1, 1, Conv, [128, 3, 2]]       # 1-P2/4
  - [-1, 3, C2f, [128, True]]        # 2
  - [-1, 1, CBAM, [128]]             # 3  CBAM on P2
  - [-1, 1, Conv, [256, 3, 2]]       # 4-P3/8
  - [-1, 6, C2f, [256, True]]        # 5
  - [-1, 1, CBAM, [256]]             # 6  CBAM on P3
  - [-1, 1, Conv, [512, 3, 2]]       # 7-P4/16
  - [-1, 6, C2f, [512, True]]        # 8
  - [-1, 1, CBAM, [512]]             # 9  CBAM on P4
  - [-1, 1, Conv, [1024, 3, 2]]      # 10-P5/32
  - [-1, 3, C2f, [1024, True]]       # 11
  - [-1, 1, CBAM, [1024]]            # 12 CBAM on P5
  - [-1, 1, SPPF, [1024, 5]]         # 13

head:
  - [-1, 1, nn.Upsample, [None, 2, "nearest"]]  # 14
  - [[-1, 9], 1, Concat, [1]]        # 15
  - [-1, 3, C2f, [512]]              # 16
  - [-1, 1, CoordAtt, [512]]         # 17 CoordAtt

  - [-1, 1, nn.Upsample, [None, 2, "nearest"]]  # 18
  - [[-1, 6], 1, Concat, [1]]        # 19
  - [-1, 3, C2f, [256]]              # 20
  - [-1, 1, CoordAtt, [256]]         # 21 CoordAtt

  - [-1, 1, Conv, [256, 3, 2]]       # 22
  - [[-1, 17], 1, Concat, [1]]       # 23
  - [-1, 3, C2f, [512]]              # 24
  - [-1, 1, CoordAtt, [512]]         # 25 CoordAtt

  - [-1, 1, Conv, [512, 3, 2]]       # 26
  - [[-1, 13], 1, Concat, [1]]       # 27
  - [-1, 3, C2f, [1024]]             # 28
  - [-1, 1, CoordAtt, [1024]]        # 29 CoordAtt

  - [[21, 25, 29], 1, Detect, [nc]]  # 30
```

---

## CELL 8 — Create CA-YOLOv8-P2 Architecture Config (4-Head for Small Objects)

```python
%%writefile configs/ca_yolov8_p2.yaml
# CA-YOLOv8-P2: With extra P2 head for small ID card detection
# 4-head detection (P2, P3, P4, P5)

nc: 2
scales:
  m: [0.67, 0.75, 768]

backbone:
  - [-1, 1, Conv, [64, 3, 2]]        # 0-P1/2
  - [-1, 1, Conv, [128, 3, 2]]       # 1-P2/4
  - [-1, 3, C2f, [128, True]]        # 2
  - [-1, 1, CBAM, [128]]             # 3
  - [-1, 1, Conv, [256, 3, 2]]       # 4-P3/8
  - [-1, 6, C2f, [256, True]]        # 5
  - [-1, 1, CBAM, [256]]             # 6
  - [-1, 1, Conv, [512, 3, 2]]       # 7-P4/16
  - [-1, 6, C2f, [512, True]]        # 8
  - [-1, 1, CBAM, [512]]             # 9
  - [-1, 1, Conv, [1024, 3, 2]]      # 10-P5/32
  - [-1, 3, C2f, [1024, True]]       # 11
  - [-1, 1, CBAM, [1024]]            # 12
  - [-1, 1, SPPF, [1024, 5]]         # 13

head:
  - [-1, 1, nn.Upsample, [None, 2, "nearest"]]  # 14
  - [[-1, 9], 1, Concat, [1]]        # 15
  - [-1, 3, C2f, [512]]              # 16
  - [-1, 1, CoordAtt, [512]]         # 17

  - [-1, 1, nn.Upsample, [None, 2, "nearest"]]  # 18
  - [[-1, 6], 1, Concat, [1]]        # 19
  - [-1, 3, C2f, [256]]              # 20
  - [-1, 1, CoordAtt, [256]]         # 21

  - [-1, 1, nn.Upsample, [None, 2, "nearest"]]  # 22
  - [[-1, 3], 1, Concat, [1]]        # 23
  - [-1, 3, C2f, [128]]              # 24
  - [-1, 1, CoordAtt, [128]]         # 25

  - [-1, 1, Conv, [128, 3, 2]]       # 26
  - [[-1, 21], 1, Concat, [1]]       # 27
  - [-1, 3, C2f, [256]]              # 28

  - [-1, 1, Conv, [256, 3, 2]]       # 29
  - [[-1, 17], 1, Concat, [1]]       # 30
  - [-1, 3, C2f, [512]]              # 31

  - [-1, 1, Conv, [512, 3, 2]]       # 32
  - [[-1, 13], 1, Concat, [1]]       # 33
  - [-1, 3, C2f, [1024]]             # 34

  - [[25, 28, 31, 34], 1, Detect, [nc]]  # 35
```

---

## CELL 9 — Download Dataset from Roboflow

```python
# ======================================================================
# ROBOFLOW DATASET DOWNLOAD
# ======================================================================
# In Roboflow:
#   1. Go to your project → "Generate" → "Get Dataset"
#   2. Select Format: "YOLOv8"  (this is critical!)
#   3. Click "Show download code" → copy your API key, workspace, project, version
#   4. Paste those values below
# ======================================================================

from roboflow import Roboflow

# >>>>>>>>>> YOUR ROBOFLOW CREDENTIALS <<<<<<<<<<
ROBOFLOW_API_KEY = "ZtmYcD2C7omgXhd1ovm2"
WORKSPACE_NAME   = "nithwin"
PROJECT_NAME     = "idcard_2_1"
VERSION_NUMBER   = 1
# >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

rf = Roboflow(api_key=ROBOFLOW_API_KEY)
project = rf.workspace(WORKSPACE_NAME).project(PROJECT_NAME)
version = project.version(VERSION_NUMBER)
dataset = version.download("yolov8")

# The dataset is downloaded to: dataset.location
DATASET_PATH = dataset.location
print(f"\nDataset downloaded to: {DATASET_PATH}")

# Roboflow auto-generates a data.yaml — let's check it
import os
import yaml

roboflow_yaml = os.path.join(DATASET_PATH, 'data.yaml')
if os.path.exists(roboflow_yaml):
    with open(roboflow_yaml, 'r') as f:
        data_config = yaml.safe_load(f)
    print(f"\nRoboflow data.yaml contents:")
    print(f"  Classes: {data_config.get('names', 'N/A')}")
    print(f"  NC: {data_config.get('nc', 'N/A')}")
    print(f"  Train: {data_config.get('train', 'N/A')}")
    print(f"  Val: {data_config.get('val', 'N/A')}")
else:
    print("WARNING: data.yaml not found!")

# Now create our own dataset.yaml that points to the Roboflow download
# (Roboflow's data.yaml sometimes uses relative paths that break — this is safer)
train_dir = os.path.join(DATASET_PATH, 'train', 'images')
val_dir = os.path.join(DATASET_PATH, 'valid', 'images')
test_dir = os.path.join(DATASET_PATH, 'test', 'images')

dataset_yaml = f"""path: {DATASET_PATH}
train: train/images
val: valid/images
test: test/images

names:
  0: card
  1: person

nc: 2
"""

with open('configs/dataset.yaml', 'w') as f:
    f.write(dataset_yaml)

print(f"\n✅ Dataset config saved to configs/dataset.yaml")

# Count images per split
for split_name, split_dir in [('train', train_dir), ('val', val_dir), ('test', test_dir)]:
    if os.path.exists(split_dir):
        n = len([f for f in os.listdir(split_dir) if f.endswith(('.jpg', '.png', '.jpeg'))])
        print(f"  {split_name}: {n} images")
    else:
        print(f"  {split_name}: directory not found at {split_dir}")
```

---

## CELL 10 — Verify Roboflow Dataset Structure & Labels

```python
# ====================================================================
# Verify dataset downloaded correctly from Roboflow
# This checks label format, class distribution, and sample images
# ====================================================================

import os
from collections import Counter
import matplotlib.pyplot as plt
import cv2
import glob

DATASET_PATH = dataset.location  # From Cell 9

print("=" * 60)
print("  DATASET VERIFICATION")
print("=" * 60)

# Check folder structure
print("\nFolder structure:")
for root, dirs, files in os.walk(DATASET_PATH):
    level = root.replace(DATASET_PATH, '').count(os.sep)
    indent = '  ' * level
    print(f"{indent}{os.path.basename(root)}/")
    if level < 2:
        for d in dirs:
            print(f"{indent}  {d}/")

# Count images and labels per split
print("\nDataset counts:")
total_images = 0
class_counts = Counter()

for split in ['train', 'valid', 'test']:
    img_dir = os.path.join(DATASET_PATH, split, 'images')
    lbl_dir = os.path.join(DATASET_PATH, split, 'labels')

    if not os.path.exists(img_dir):
        print(f"  {split}: NOT FOUND")
        continue

    imgs = glob.glob(os.path.join(img_dir, '*.*'))
    lbls = glob.glob(os.path.join(lbl_dir, '*.txt')) if os.path.exists(lbl_dir) else []
    total_images += len(imgs)
    print(f"  {split}: {len(imgs)} images, {len(lbls)} labels")

    # Count class distribution
    for lbl_file in lbls:
        with open(lbl_file, 'r') as f:
            for line in f:
                parts = line.strip().split()
                if parts:
                    class_counts[int(parts[0])] += 1

print(f"\nTotal images: {total_images}")
print(f"\nClass distribution (across all splits):")
class_names = {0: 'card', 1: 'person'}
for cls_id, count in sorted(class_counts.items()):
    name = class_names.get(cls_id, f'class_{cls_id}')
    print(f"  {cls_id} ({name}): {count} annotations")

# Show 4 sample images with labels drawn
print("\nSample images:")
train_imgs = glob.glob(os.path.join(DATASET_PATH, 'train', 'images', '*.*'))[:4]
fig, axes = plt.subplots(1, min(4, len(train_imgs)), figsize=(16, 4))
if len(train_imgs) == 1:
    axes = [axes]

for idx, img_path in enumerate(train_imgs):
    img = cv2.imread(img_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    h, w = img.shape[:2]

    # Draw labels
    lbl_path = img_path.replace('/images/', '/labels/').rsplit('.', 1)[0] + '.txt'
    if os.path.exists(lbl_path):
        with open(lbl_path, 'r') as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) == 5:
                    cls, cx, cy, bw, bh = int(parts[0]), float(parts[1]), float(parts[2]), float(parts[3]), float(parts[4])
                    x1 = int((cx - bw/2) * w)
                    y1 = int((cy - bh/2) * h)
                    x2 = int((cx + bw/2) * w)
                    y2 = int((cy + bh/2) * h)
                    color = (0, 255, 0) if cls == 0 else (255, 0, 0)
                    label = class_names.get(cls, str(cls))
                    cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
                    cv2.putText(img, label, (x1, y1-5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

    axes[idx].imshow(img)
    axes[idx].set_title(os.path.basename(img_path), fontsize=8)
    axes[idx].axis('off')

plt.suptitle('Sample Training Images with Labels', fontsize=14)
plt.tight_layout()
plt.show()

print("\n✅ Dataset verification complete!")
```

---

## CELL 11 — Register Modules & Verify

```python
import sys
sys.path.insert(0, '/content/CA_YOLOv8_ID_Detection')

from custom_modules.register import register_custom_modules
register_custom_modules()

# Verify modules work
from custom_modules.attention import CBAM, CoordAtt, C2f_CBAM
import torch

# Test CBAM
x = torch.randn(1, 256, 80, 80).cuda()
cbam = CBAM(256).cuda()
out = cbam(x)
print(f"CBAM: input {x.shape} -> output {out.shape} ✓")

# Test CoordAtt
ca = CoordAtt(256).cuda()
out = ca(x)
print(f"CoordAtt: input {x.shape} -> output {out.shape} ✓")

# Count parameters
cbam_params = sum(p.numel() for p in cbam.parameters())
ca_params = sum(p.numel() for p in ca.parameters())
print(f"\nCBAM params: {cbam_params:,}")
print(f"CoordAtt params: {ca_params:,}")
print(f"\nAll modules verified! Ready to train.")
```

---

## CELL 11b — Check Dataset Size (RAM Safety Check)

```python
# ============================================================
# Run this before training to decide cache='ram' vs cache=True
# cache='ram'  → loads ALL images into CPU RAM (fastest, but needs ~6GB+ free)
# cache=True   → caches to local SSD (slower than RAM, but safe for big datasets)
# ============================================================

import os
import shutil

DATASET_PATH = dataset.location  # From Cell 9

# Check dataset disk size
total_size = 0
for dirpath, dirnames, filenames in os.walk(DATASET_PATH):
    for f in filenames:
        fp = os.path.join(dirpath, f)
        total_size += os.path.getsize(fp)
size_gb = total_size / 1e9

# Check available RAM
mem = shutil.disk_usage('/content')
ram_info = os.popen("free -h").read()

print(f"Dataset size:     {size_gb:.2f} GB")
print(f"\nSystem memory:")
print(ram_info)

if size_gb < 6:
    print(f"✅ Dataset ({size_gb:.1f} GB) fits in RAM → using cache='ram' (fastest)")
else:
    print(f"⚠️  Dataset ({size_gb:.1f} GB) is large → change cache='ram' to cache=True in training cells")
```

---

## CELL 11c — GPU Memory Cleanup (Run Before Each Experiment)

```python
# ============================================================
# IMPORTANT: Run this cell BEFORE each training experiment
# Clears leftover GPU memory from previous runs
# If this doesn't help, do: Runtime → Restart runtime
# ============================================================

import gc
import torch

# Delete any leftover model variables
for var_name in ['model_baseline', 'model_ca', 'model_p2', 'model_cbam',
                 'results_baseline', 'results_ca', 'results_p2', 'results_cbam',
                 'pretrained']:
    if var_name in dir():
        exec(f'del {var_name}')

gc.collect()
torch.cuda.empty_cache()
torch.cuda.reset_peak_memory_stats()

# Verify GPU is free
free_mem = torch.cuda.mem_get_info()[0] / 1e9
total_mem = torch.cuda.mem_get_info()[1] / 1e9
print(f"GPU Memory: {free_mem:.1f} GB free / {total_mem:.1f} GB total")
if free_mem < total_mem * 0.8:
    print("⚠️  GPU still has memory in use! Do: Runtime → Restart runtime")
else:
    print("✅ GPU memory is clean, ready to train!")
```

---

## CELL 12 — EXPERIMENT 1: Train Baseline YOLOv8m (for comparison)

```python
from ultralytics import YOLO

# ============================================================
# EXPERIMENT 1: Baseline YOLOv8m (standard, no modifications)
# This is our reference to compare against
# ============================================================

model_baseline = YOLO('yolov8m.pt')  # Load pretrained YOLOv8m

results_baseline = model_baseline.train(
    data='configs/dataset.yaml',
    epochs=150,
    imgsz=640,
    batch=-1,          # auto-batch: finds max batch size that fits your GPU
    cache='ram',       # load dataset into RAM after epoch 1 (eliminates I/O wait)
    workers=8,         # parallel data loading threads
    device=0,          # explicit GPU
    amp=True,          # mixed precision (FP16) — ~1.5x faster on T4/A100
    patience=30,
    optimizer='SGD',
    lr0=0.01,
    lrf=0.01,
    momentum=0.937,
    weight_decay=0.0005,
    warmup_epochs=3,
    warmup_momentum=0.8,
    warmup_bias_lr=0.1,
    box=7.5,
    cls=0.5,
    dfl=1.5,
    hsv_h=0.015,
    hsv_s=0.7,
    hsv_v=0.4,
    degrees=0.0,
    translate=0.1,
    scale=0.5,
    fliplr=0.5,
    mosaic=1.0,
    mixup=0.15,
    close_mosaic=20,
    project='runs',
    name='baseline_yolov8m',
    exist_ok=True,
    verbose=True,
    seed=42,
)

print("\n✅ Baseline YOLOv8m training complete!")

# Free GPU memory before next experiment
import gc; gc.collect()
import torch; torch.cuda.empty_cache()
del model_baseline, results_baseline
gc.collect(); torch.cuda.empty_cache()
print(f"GPU free: {torch.cuda.mem_get_info()[0]/1e9:.1f} GB")
```

---

## CELL 13 — EXPERIMENT 2: Train CA-YOLOv8 (Our Model — 3 Head)

```python
import sys
sys.path.insert(0, '/content/CA_YOLOv8_ID_Detection')

from custom_modules.register import register_custom_modules
register_custom_modules()

from ultralytics import YOLO

# ============================================================
# EXPERIMENT 2: CA-YOLOv8 (CBAM + CoordAtt, 3 detection heads)
# Our novel architecture
# ============================================================

model_ca = YOLO('configs/ca_yolov8.yaml')  # Build from custom YAML

# Load pretrained backbone weights (transfer learning)
# This loads matching layers from yolov8m.pt pretrained on COCO
pretrained = YOLO('yolov8m.pt')
# Transfer matching weights
state_dict = pretrained.model.state_dict()
model_state = model_ca.model.state_dict()
transferred = 0
for k, v in state_dict.items():
    if k in model_state and v.shape == model_state[k].shape:
        model_state[k] = v
        transferred += 1
model_ca.model.load_state_dict(model_state, strict=False)
print(f"Transferred {transferred} layers from pretrained YOLOv8m")

results_ca = model_ca.train(
    data='configs/dataset.yaml',
    epochs=150,
    imgsz=640,
    batch=-1,          # auto-batch: finds max batch size that fits your GPU
    cache='ram',       # load dataset into RAM after epoch 1 (eliminates I/O wait)
    workers=8,         # parallel data loading threads
    device=0,          # explicit GPU
    amp=True,          # mixed precision (FP16) — ~1.5x faster on T4/A100
    patience=30,
    optimizer='SGD',
    lr0=0.01,
    lrf=0.01,
    momentum=0.937,
    weight_decay=0.0005,
    warmup_epochs=3,
    warmup_momentum=0.8,
    warmup_bias_lr=0.1,
    box=7.5,
    cls=0.5,
    dfl=1.5,
    hsv_h=0.015,
    hsv_s=0.7,
    hsv_v=0.4,
    degrees=0.0,
    translate=0.1,
    scale=0.5,
    fliplr=0.5,
    mosaic=1.0,
    mixup=0.15,
    close_mosaic=20,
    project='runs',
    name='ca_yolov8_3head',
    exist_ok=True,
    verbose=True,
    seed=42,
)

print("\n✅ CA-YOLOv8 (3-head) training complete!")

# Free GPU memory before next experiment
import gc; gc.collect()
import torch; torch.cuda.empty_cache()
del model_ca, results_ca, pretrained
gc.collect(); torch.cuda.empty_cache()
print(f"GPU free: {torch.cuda.mem_get_info()[0]/1e9:.1f} GB")
```

---

## CELL 14 — EXPERIMENT 3: Train CA-YOLOv8-P2 (Our Model — 4 Head, Small Object)

```python
import sys
sys.path.insert(0, '/content/CA_YOLOv8_ID_Detection')

from custom_modules.register import register_custom_modules
register_custom_modules()

from ultralytics import YOLO

# ============================================================
# EXPERIMENT 3: CA-YOLOv8-P2 (CBAM + CoordAtt + P2 small obj head)
# Best accuracy model — 4 detection heads
# ============================================================

model_p2 = YOLO('configs/ca_yolov8_p2.yaml')

# Transfer pretrained weights
pretrained = YOLO('yolov8m.pt')
state_dict = pretrained.model.state_dict()
model_state = model_p2.model.state_dict()
transferred = 0
for k, v in state_dict.items():
    if k in model_state and v.shape == model_state[k].shape:
        model_state[k] = v
        transferred += 1
model_p2.model.load_state_dict(model_state, strict=False)
print(f"Transferred {transferred} layers from pretrained YOLOv8m")

results_p2 = model_p2.train(
    data='configs/dataset.yaml',
    epochs=150,
    imgsz=640,
    batch=-1,          # auto-batch: finds max batch size (P2 head uses more memory)
    cache='ram',       # load dataset into RAM after epoch 1 (eliminates I/O wait)
    workers=8,         # parallel data loading threads
    device=0,          # explicit GPU
    amp=True,          # mixed precision halves VRAM usage, allows larger batch
    patience=30,
    optimizer='SGD',
    lr0=0.01,
    lrf=0.01,
    momentum=0.937,
    weight_decay=0.0005,
    warmup_epochs=3,
    warmup_momentum=0.8,
    warmup_bias_lr=0.1,
    box=7.5,
    cls=0.5,
    dfl=1.5,
    hsv_h=0.015,
    hsv_s=0.7,
    hsv_v=0.4,
    degrees=0.0,
    translate=0.1,
    scale=0.5,
    fliplr=0.5,
    mosaic=1.0,
    mixup=0.15,
    close_mosaic=20,
    project='runs',
    name='ca_yolov8_p2_4head',
    exist_ok=True,
    verbose=True,
    seed=42,
)

print("\n✅ CA-YOLOv8-P2 (4-head) training complete!")

# Free GPU memory before next step
import gc; gc.collect()
import torch; torch.cuda.empty_cache()
del model_p2, results_p2, pretrained
gc.collect(); torch.cuda.empty_cache()
print(f"GPU free: {torch.cuda.mem_get_info()[0]/1e9:.1f} GB")
```

---

## CELL 15 — Validate All Models

```python
import sys
sys.path.insert(0, '/content/CA_YOLOv8_ID_Detection')
from custom_modules.register import register_custom_modules
register_custom_modules()

from ultralytics import YOLO

print("=" * 70)
print("  MODEL VALIDATION RESULTS")
print("=" * 70)

models = {
    'Baseline YOLOv8m':  'runs/baseline_yolov8m/weights/best.pt',
    'CA-YOLOv8 (3-head)': 'runs/ca_yolov8_3head/weights/best.pt',
    'CA-YOLOv8-P2 (4-head)': 'runs/ca_yolov8_p2_4head/weights/best.pt',
}

results_table = []

for name, path in models.items():
    try:
        model = YOLO(path)
        metrics = model.val(data='configs/dataset.yaml', imgsz=640, verbose=False)

        map50 = metrics.box.map50
        map50_95 = metrics.box.map
        precision = metrics.box.mp
        recall = metrics.box.mr

        # Per-class AP
        ap_card = metrics.box.ap50[0] if len(metrics.box.ap50) > 0 else 0
        ap_person = metrics.box.ap50[1] if len(metrics.box.ap50) > 1 else 0

        results_table.append({
            'Model': name,
            'mAP@50': f'{map50:.4f}',
            'mAP@50:95': f'{map50_95:.4f}',
            'Precision': f'{precision:.4f}',
            'Recall': f'{recall:.4f}',
            'AP_card@50': f'{ap_card:.4f}',
            'AP_person@50': f'{ap_person:.4f}',
        })
        print(f"\n  {name}:")
        print(f"    mAP@0.5:      {map50:.4f}")
        print(f"    mAP@0.5:0.95: {map50_95:.4f}")
        print(f"    Precision:     {precision:.4f}")
        print(f"    Recall:        {recall:.4f}")
        print(f"    AP_card@0.5:   {ap_card:.4f}")
        print(f"    AP_person@0.5: {ap_person:.4f}")
    except Exception as e:
        print(f"\n  {name}: ERROR - {e}")

print("\n" + "=" * 70)
```

---

## CELL 16 — Comparison Table & Charts

```python
import matplotlib.pyplot as plt
import matplotlib
matplotlib.rcParams['figure.figsize'] = (14, 5)

# ============================================================
# Plot training curves for all experiments
# ============================================================

import pandas as pd

fig, axes = plt.subplots(1, 3, figsize=(18, 5))

experiments = {
    'Baseline YOLOv8m': 'runs/baseline_yolov8m/results.csv',
    'CA-YOLOv8': 'runs/ca_yolov8_3head/results.csv',
    'CA-YOLOv8-P2': 'runs/ca_yolov8_p2_4head/results.csv',
}

colors = ['#3b82f6', '#22c55e', '#ef4444']

for idx, (name, csv_path) in enumerate(experiments.items()):
    try:
        df = pd.read_csv(csv_path)
        df.columns = df.columns.str.strip()

        # Plot mAP@50
        if 'metrics/mAP50(B)' in df.columns:
            axes[0].plot(df['epoch'], df['metrics/mAP50(B)'], label=name, color=colors[idx], linewidth=2)
        # Plot box loss
        if 'train/box_loss' in df.columns:
            axes[1].plot(df['epoch'], df['train/box_loss'], label=name, color=colors[idx], linewidth=2)
        # Plot cls loss
        if 'train/cls_loss' in df.columns:
            axes[2].plot(df['epoch'], df['train/cls_loss'], label=name, color=colors[idx], linewidth=2)
    except Exception as e:
        print(f"Could not load {csv_path}: {e}")

axes[0].set_title('mAP@0.5 vs Epoch', fontsize=13, fontweight='bold')
axes[0].set_xlabel('Epoch')
axes[0].set_ylabel('mAP@0.5')
axes[0].legend()
axes[0].grid(True, alpha=0.3)

axes[1].set_title('Box Loss vs Epoch', fontsize=13, fontweight='bold')
axes[1].set_xlabel('Epoch')
axes[1].set_ylabel('Box Loss')
axes[1].legend()
axes[1].grid(True, alpha=0.3)

axes[2].set_title('Classification Loss vs Epoch', fontsize=13, fontweight='bold')
axes[2].set_xlabel('Epoch')
axes[2].set_ylabel('Cls Loss')
axes[2].legend()
axes[2].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('runs/training_comparison.png', dpi=150, bbox_inches='tight')
plt.show()

print("Training comparison chart saved!")
```

---

## CELL 17 — Ablation Study (Individual Component Contribution)

```python
import sys
sys.path.insert(0, '/content/CA_YOLOv8_ID_Detection')
from custom_modules.register import register_custom_modules
register_custom_modules()

from ultralytics import YOLO

# ============================================================
# ABLATION: CBAM Only (no CoordAtt, standard 3 heads)
# ============================================================

# Write CBAM-only config
cbam_only_yaml = """
nc: 2
scales:
  m: [0.67, 0.75, 768]

backbone:
  - [-1, 1, Conv, [64, 3, 2]]
  - [-1, 1, Conv, [128, 3, 2]]
  - [-1, 3, C2f, [128, True]]
  - [-1, 1, CBAM, [128]]
  - [-1, 1, Conv, [256, 3, 2]]
  - [-1, 6, C2f, [256, True]]
  - [-1, 1, CBAM, [256]]
  - [-1, 1, Conv, [512, 3, 2]]
  - [-1, 6, C2f, [512, True]]
  - [-1, 1, CBAM, [512]]
  - [-1, 1, Conv, [1024, 3, 2]]
  - [-1, 3, C2f, [1024, True]]
  - [-1, 1, CBAM, [1024]]
  - [-1, 1, SPPF, [1024, 5]]

head:
  - [-1, 1, nn.Upsample, [None, 2, "nearest"]]
  - [[-1, 9], 1, Concat, [1]]
  - [-1, 3, C2f, [512]]

  - [-1, 1, nn.Upsample, [None, 2, "nearest"]]
  - [[-1, 6], 1, Concat, [1]]
  - [-1, 3, C2f, [256]]

  - [-1, 1, Conv, [256, 3, 2]]
  - [[-1, 16], 1, Concat, [1]]
  - [-1, 3, C2f, [512]]

  - [-1, 1, Conv, [512, 3, 2]]
  - [[-1, 13], 1, Concat, [1]]
  - [-1, 3, C2f, [1024]]

  - [[19, 22, 25], 1, Detect, [nc]]
"""

with open('configs/ablation_cbam_only.yaml', 'w') as f:
    f.write(cbam_only_yaml)

model_cbam = YOLO('configs/ablation_cbam_only.yaml')
pretrained = YOLO('yolov8m.pt')
state_dict = pretrained.model.state_dict()
model_state = model_cbam.model.state_dict()
for k, v in state_dict.items():
    if k in model_state and v.shape == model_state[k].shape:
        model_state[k] = v
model_cbam.model.load_state_dict(model_state, strict=False)

results_cbam = model_cbam.train(
    data='configs/dataset.yaml',
    epochs=150,
    imgsz=640,
    batch=-1,          # auto-batch: finds max batch size
    cache='ram',       # load dataset into RAM after epoch 1
    workers=8,
    device=0,
    amp=True,
    patience=25,
    optimizer='SGD',
    lr0=0.01,
    lrf=0.01,
    momentum=0.937,
    weight_decay=0.0005,
    warmup_epochs=3,
    mosaic=1.0,
    mixup=0.15,
    close_mosaic=15,
    project='runs',
    name='ablation_cbam_only',
    exist_ok=True,
    seed=42,
)
print("\n✅ Ablation: CBAM-only training complete!")
```

---

## CELL 18 — Model Speed Benchmark

```python
import sys
sys.path.insert(0, '/content/CA_YOLOv8_ID_Detection')
from custom_modules.register import register_custom_modules
register_custom_modules()

from ultralytics import YOLO
import torch
import time
import numpy as np

def benchmark(model_path, name, runs=100):
    model = YOLO(model_path)
    dummy = np.random.randint(0, 255, (640, 640, 3), dtype=np.uint8)

    # Warmup
    for _ in range(10):
        model(dummy, verbose=False)

    # Time it
    times = []
    for _ in range(runs):
        start = time.perf_counter()
        model(dummy, verbose=False)
        times.append((time.perf_counter() - start) * 1000)

    times = np.array(times)
    params = sum(p.numel() for p in model.model.parameters())
    print(f"  {name:<30} | Params: {params/1e6:.1f}M | "
          f"Latency: {times.mean():.1f}ms | FPS: {1000/times.mean():.1f}")

print("\n" + "=" * 80)
print("  SPEED BENCHMARK (T4 GPU)")
print("=" * 80 + "\n")

benchmark('runs/baseline_yolov8m/weights/best.pt', 'Baseline YOLOv8m')
benchmark('runs/ca_yolov8_3head/weights/best.pt', 'CA-YOLOv8 (3-head)')
benchmark('runs/ca_yolov8_p2_4head/weights/best.pt', 'CA-YOLOv8-P2 (4-head)')

try:
    benchmark('runs/ablation_cbam_only/weights/best.pt', 'Ablation: CBAM-only')
except:
    pass

print("\n" + "=" * 80)
```

---

## CELL 19 — Test Predictions on Sample Images

```python
import sys
sys.path.insert(0, '/content/CA_YOLOv8_ID_Detection')
from custom_modules.register import register_custom_modules
register_custom_modules()

from ultralytics import YOLO
import matplotlib.pyplot as plt
import cv2
import os
import glob

# Load best model
BEST_MODEL = 'runs/ca_yolov8_3head/weights/best.pt'  # Change to your best model
model = YOLO(BEST_MODEL)

# Get some test images (uses DATASET_PATH from Cell 9)
DATASET_PATH = dataset.location  # From Cell 9 Roboflow download
test_dir = os.path.join(DATASET_PATH, 'valid', 'images')

test_images = glob.glob(os.path.join(test_dir, '*.jpg'))[:8]

fig, axes = plt.subplots(2, 4, figsize=(20, 10))
axes = axes.flatten()

for idx, img_path in enumerate(test_images):
    results = model(img_path, conf=0.5, verbose=False)[0]
    annotated = results.plot()
    annotated = cv2.cvtColor(annotated, cv2.COLOR_BGR2RGB)
    axes[idx].imshow(annotated)
    axes[idx].set_title(os.path.basename(img_path), fontsize=9)
    axes[idx].axis('off')

# Hide unused axes
for idx in range(len(test_images), len(axes)):
    axes[idx].axis('off')

plt.suptitle(f'CA-YOLOv8 Predictions', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.savefig('runs/sample_predictions.png', dpi=150, bbox_inches='tight')
plt.show()
```

---

## CELL 20 — Confusion Matrix & Per-Class Analysis

```python
import sys
sys.path.insert(0, '/content/CA_YOLOv8_ID_Detection')
from custom_modules.register import register_custom_modules
register_custom_modules()

from ultralytics import YOLO
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import os

# Validate and generate confusion matrix
model = YOLO('runs/ca_yolov8_3head/weights/best.pt')
metrics = model.val(
    data='configs/dataset.yaml',
    imgsz=640,
    plots=True,    # This generates confusion matrix, PR curve, etc.
    verbose=True,
)

print(f"\n{'='*60}")
print(f"  FINAL RESULTS — CA-YOLOv8")
print(f"{'='*60}")
print(f"  mAP@0.5:        {metrics.box.map50:.4f}")
print(f"  mAP@0.5:0.95:   {metrics.box.map:.4f}")
print(f"  Precision:       {metrics.box.mp:.4f}")
print(f"  Recall:          {metrics.box.mr:.4f}")

# Per class
for i, name in enumerate(['card', 'person']):
    if i < len(metrics.box.ap50):
        print(f"  AP_{name}@0.5:    {metrics.box.ap50[i]:.4f}")

# Show confusion matrix if generated
conf_matrix_path = 'runs/ca_yolov8_3head/val/confusion_matrix.png'
if os.path.exists(conf_matrix_path):
    print("\nConfusion Matrix:")
    img = mpimg.imread(conf_matrix_path)
    plt.figure(figsize=(8, 8))
    plt.imshow(img)
    plt.axis('off')
    plt.show()
```

---

## CELL 21 — Export Best Model

```python
import sys
sys.path.insert(0, '/content/CA_YOLOv8_ID_Detection')
from custom_modules.register import register_custom_modules
register_custom_modules()

from ultralytics import YOLO

# Export to ONNX for deployment
model = YOLO('runs/ca_yolov8_3head/weights/best.pt')

# ONNX export
model.export(format='onnx', imgsz=640, simplify=True)
print("✅ ONNX export complete!")

# TorchScript export
model.export(format='torchscript', imgsz=640)
print("✅ TorchScript export complete!")
```

---

## CELL 22 — Copy Best Models to Google Drive

```python
import shutil
import os

SAVE_DIR = '/content/drive/MyDrive/CA_YOLOv8_Results'
os.makedirs(SAVE_DIR, exist_ok=True)

# Copy best weights
models_to_save = {
    'baseline_yolov8m': 'runs/baseline_yolov8m/weights/best.pt',
    'ca_yolov8_3head': 'runs/ca_yolov8_3head/weights/best.pt',
    'ca_yolov8_p2_4head': 'runs/ca_yolov8_p2_4head/weights/best.pt',
}

for name, path in models_to_save.items():
    if os.path.exists(path):
        dest = os.path.join(SAVE_DIR, f'{name}_best.pt')
        shutil.copy2(path, dest)
        size_mb = os.path.getsize(dest) / 1e6
        print(f"  Saved: {name}_best.pt ({size_mb:.1f} MB)")

# Copy training results
for exp_name in ['baseline_yolov8m', 'ca_yolov8_3head', 'ca_yolov8_p2_4head']:
    results_csv = f'runs/{exp_name}/results.csv'
    if os.path.exists(results_csv):
        shutil.copy2(results_csv, os.path.join(SAVE_DIR, f'{exp_name}_results.csv'))

# Copy comparison chart
if os.path.exists('runs/training_comparison.png'):
    shutil.copy2('runs/training_comparison.png', os.path.join(SAVE_DIR, 'training_comparison.png'))

if os.path.exists('runs/sample_predictions.png'):
    shutil.copy2('runs/sample_predictions.png', os.path.join(SAVE_DIR, 'sample_predictions.png'))

print(f"\n✅ All results saved to: {SAVE_DIR}")
```

---

## CELL 23 — Final Summary & Paper-Ready Results Table

```python
print("""
╔══════════════════════════════════════════════════════════════════════╗
║                    CA-YOLOv8 TRAINING COMPLETE                     ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  3 Experiments completed:                                          ║
║                                                                    ║
║  1. Baseline YOLOv8m        — Standard model (reference)           ║
║  2. CA-YOLOv8 (3-head)      — CBAM + CoordAtt in backbone/neck    ║
║  3. CA-YOLOv8-P2 (4-head)   — Above + P2 small object head        ║
║                                                                    ║
║  Key innovations:                                                  ║
║  • CBAM in backbone → task-aware feature extraction                ║
║  • Coordinate Attention in neck → position-aware fusion            ║
║  • P2 detection head → 4x better resolution for small ID cards     ║
║                                                                    ║
║  Results saved to Google Drive!                                    ║
║  Next: Build face recognition + web dashboard                      ║
║                                                                    ║
╚══════════════════════════════════════════════════════════════════════╝
""")
```

---

# IMPORTANT NOTES

## Roboflow Setup (Do This First!):
1. Go to [roboflow.com](https://roboflow.com) → Open your project
2. Click **"Generate"** → Choose your preprocessing/augmentation → **"Generate"**
3. Click **"Get Dataset"** → **Select Format: "YOLOv8"** (VERY IMPORTANT!)
4. Click **"Show download code"** → Copy the API key, workspace, project, version
5. Paste those 4 values into **Cell 9**

## Roboflow Format Selection:
```
✅ CORRECT: "YOLOv8"         → gives train/images/, train/labels/ with .txt YOLO labels
✅ ALSO OK: "YOLOv5 PyTorch"  → identical format, works perfectly
❌ WRONG:   "COCO"            → JSON format, won't work
❌ WRONG:   "Pascal VOC"      → XML format, won't work
❌ WRONG:   "YOLOv7 PyTorch"  → slightly different structure
```

## Roboflow download creates this structure automatically:
```
project-name-version/
├── data.yaml              ← config file (auto-generated)
├── train/
│   ├── images/            ← training images (.jpg)
│   └── labels/            ← training labels (.txt, YOLO format)
├── valid/
│   ├── images/            ← validation images
│   └── labels/            ← validation labels
└── test/
    ├── images/            ← test images
    └── labels/            ← test labels
```
**Note:** Roboflow uses `valid/` (not `val/`). Our Cell 9 handles this correctly.

## Label format (YOLO — auto-generated by Roboflow):
Each `.txt` file has one line per object:
```
class_id x_center y_center width height
```
- `class_id`: 0 = card, 1 = person (check your Roboflow class order!)
- All values normalized (0 to 1)
- Example: `0 0.45 0.55 0.12 0.08` means a card at center (45%, 55%) with size (12%, 8%)

## ⚠️ CHECK YOUR CLASS ORDER!
Roboflow assigns class IDs alphabetically by default:
- If your classes are: `card`, `person` → 0=card, 1=person ✅ (matches our config)
- If reversed, update `names:` in Cell 9's dataset_yaml to match

## If GPU runs out of memory:
- `batch=-1` (auto-batch) should handle this automatically
- If still OOM: set `batch=8` manually, or try `imgsz=512` instead of 640
- Switch `cache='ram'` to `cache=True` if CPU RAM runs out

## Training order:
- **Run Cells 1-11 first** (Setup + Dataset + Verify)
- **Run Cell 12** (Baseline) — ~85 min
- **Then Cell 13** (CA-YOLOv8 3-head) — ~95 min
- **Then Cell 14** (CA-YOLOv8-P2 4-head) — ~110 min
- **Total: ~5 hours** for all 3 models (150 epochs each)
- Cell 17 (Ablation) is optional but good for paper

## Quick test (fewer epochs):
Change `epochs=150` to `epochs=5` for a quick test run to verify everything works.

## Roboflow API Key:
- Find it at: roboflow.com → Settings → API Key (under your workspace)
- It looks like: `abcdef123456` (a string of letters and numbers)
- Keep it private — don't share in public repos
