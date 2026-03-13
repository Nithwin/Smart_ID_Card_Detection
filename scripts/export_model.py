"""
Model Export Utilities
======================
Export trained CA-YOLOv8 to ONNX and TensorRT for deployment.
"""

import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))


def export_model(model_path, formats=None, img_size=640, half=False):
    """Export trained model to various formats.

    Args:
        model_path: Path to .pt model file.
        formats: List of export formats (default: ['onnx']).
        img_size: Input image size.
        half: Use FP16 quantization.
    """
    from ultralytics import YOLO

    try:
        from custom_modules.register import register_custom_modules
        register_custom_modules()
    except ImportError:
        pass

    if formats is None:
        formats = ['onnx']

    model = YOLO(model_path)

    for fmt in formats:
        print(f"\n[Export] Exporting to {fmt.upper()}...")
        exported = model.export(format=fmt, imgsz=img_size, half=half)
        print(f"[Export] Saved: {exported}")


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Export CA-YOLOv8 model')
    parser.add_argument('--model', type=str, required=True, help='Path to .pt model')
    parser.add_argument('--format', type=str, nargs='+', default=['onnx'], help='Export formats')
    parser.add_argument('--img-size', type=int, default=640, help='Image size')
    parser.add_argument('--half', action='store_true', help='FP16 quantization')
    args = parser.parse_args()

    export_model(args.model, args.format, args.img_size, args.half)
