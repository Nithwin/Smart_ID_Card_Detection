Conv (Convolution)
Learns local patterns (edges, corners, textures). Core building block.

BN (BatchNorm)
Stabilizes training and speeds convergence.

SiLU activation
Smooth non-linearity; often better than ReLU in YOLO-style detectors.

C2f
Efficient feature block in YOLOv8 that improves gradient flow with fewer params than heavier blocks.

CBAM
Channel attention + spatial attention. Improves “what to focus on”.

CoordAtt
Encodes attention separately along H and W axes. Improves “where to focus”.

SPPF
Fast multi-scale context aggregation using pooled receptive fields.

Upsample
Increases feature map resolution to recover small-object detail.

Concat
Fuses low-level detail with high-level semantics.

Detect head
Outputs class probability + bounding box coordinates for each scale.