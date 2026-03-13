"""
End-to-End Inference Pipeline
================================
Combines CA-YOLOv8 detection + compliance check + face recognition.
"""

import os
import sys
import cv2
import time
import numpy as np
from pathlib import Path
from datetime import datetime

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))


class SmartIDPipeline:
    """Complete pipeline: Detection → Compliance → Face Recognition → Alerts."""

    def __init__(self, model_path, face_db_dir='face_db', conf_threshold=0.5,
                 card_overlap_threshold=0.1, face_similarity_threshold=0.5):
        """
        Args:
            model_path: Path to trained CA-YOLOv8 .pt model file.
            face_db_dir: Directory containing face database.
            conf_threshold: Detection confidence threshold.
            card_overlap_threshold: IoU threshold for card-person association.
            face_similarity_threshold: Cosine similarity threshold for face matching.
        """
        self.conf_threshold = conf_threshold
        self.card_overlap_threshold = card_overlap_threshold
        self.alerts = []

        # Load YOLO model
        from ultralytics import YOLO
        # Register custom modules if using custom architecture
        try:
            from custom_modules.register import register_custom_modules
            register_custom_modules()
        except ImportError:
            pass

        self.model = YOLO(model_path)
        print(f"[Pipeline] Loaded model: {model_path}")

        # Load face recognition pipeline
        from face_recognition.face_pipeline import FacePipeline
        from face_recognition.face_database import FaceDatabase

        self.face_pipeline = FacePipeline(similarity_threshold=face_similarity_threshold)
        self.face_db = FaceDatabase(db_dir=face_db_dir, similarity_threshold=face_similarity_threshold)

    def detect(self, frame):
        """Run CA-YOLOv8 detection on a frame.

        Args:
            frame: BGR image (numpy array).

        Returns:
            dict with 'persons' and 'cards' lists of [x1,y1,x2,y2,conf] each.
        """
        results = self.model(frame, conf=self.conf_threshold, verbose=False)[0]

        persons = []
        cards = []

        for box in results.boxes:
            xyxy = box.xyxy[0].cpu().numpy()
            conf = float(box.conf[0])
            cls = int(box.cls[0])

            entry = [*xyxy, conf]
            if cls == 0:  # card
                cards.append(entry)
            elif cls == 1:  # person
                persons.append(entry)

        return {'persons': persons, 'cards': cards}

    def check_compliance(self, persons, cards):
        """Check which persons are wearing ID cards.

        A person is considered compliant if any detected card's center
        falls within the upper 60% of the person's bounding box.

        Args:
            persons: List of person boxes [x1,y1,x2,y2,conf].
            cards: List of card boxes [x1,y1,x2,y2,conf].

        Returns:
            list of dicts: [{'box': [...], 'compliant': bool, 'card_box': [...] or None}]
        """
        results = []
        used_cards = set()

        for person in persons:
            px1, py1, px2, py2, p_conf = person
            person_h = py2 - py1

            # Card wearing zone: upper 60% of person body
            card_zone_y2 = py1 + 0.6 * person_h
            compliant = False
            matched_card = None

            for i, card in enumerate(cards):
                if i in used_cards:
                    continue
                cx1, cy1, cx2, cy2, c_conf = card
                card_cx = (cx1 + cx2) / 2
                card_cy = (cy1 + cy2) / 2

                # Card center must be within person bbox horizontally
                # and within upper body zone vertically
                if (px1 <= card_cx <= px2 and py1 <= card_cy <= card_zone_y2):
                    compliant = True
                    matched_card = card
                    used_cards.add(i)
                    break

            results.append({
                'box': person[:4],
                'confidence': person[4],
                'compliant': compliant,
                'card_box': matched_card[:4] if matched_card else None,
            })

        return results

    def process_frame(self, frame):
        """Process a single frame through the complete pipeline.

        Args:
            frame: BGR image.

        Returns:
            dict with:
                - 'detections': detection results
                - 'compliance': compliance check results
                - 'violations': list of violation alerts
                - 'annotated_frame': frame with drawn boxes and labels
        """
        # Step 1: Detect persons and cards
        detections = self.detect(frame)

        # Step 2: Check compliance
        compliance = self.check_compliance(detections['persons'], detections['cards'])

        # Step 3: Process violations (face recognition)
        violations = []
        for result in compliance:
            if not result['compliant']:
                face_result = self.face_pipeline.process_violator(frame, result['box'])

                violation = {
                    'timestamp': datetime.now().isoformat(),
                    'person_box': result['box'],
                    'face_found': face_result is not None,
                    'identity': None,
                    'face_image': None,
                }

                if face_result:
                    violation['face_image'] = face_result['face_image']

                    # Try to identify
                    match = self.face_db.identify(face_result['embedding'])
                    if match:
                        violation['identity'] = match
                    else:
                        violation['identity'] = {'name': 'Unknown', 'similarity': 0.0}

                violations.append(violation)

        # Step 4: Annotate frame
        annotated = self._draw_results(frame.copy(), detections, compliance, violations)

        return {
            'detections': detections,
            'compliance': compliance,
            'violations': violations,
            'annotated_frame': annotated,
        }

    def _draw_results(self, frame, detections, compliance, violations):
        """Draw bounding boxes and labels on the frame."""
        # Draw cards (blue)
        for card in detections['cards']:
            x1, y1, x2, y2, conf = card
            cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (255, 165, 0), 2)
            cv2.putText(frame, f'Card {conf:.2f}', (int(x1), int(y1) - 5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 165, 0), 2)

        # Draw persons (green=compliant, red=violation)
        violation_idx = 0
        for result in compliance:
            box = result['box']
            x1, y1, x2, y2 = map(int, box)

            if result['compliant']:
                color = (0, 200, 0)  # Green
                label = 'ID OK'
            else:
                color = (0, 0, 255)  # Red
                label = 'NO ID!'
                if violation_idx < len(violations) and violations[violation_idx].get('identity'):
                    name = violations[violation_idx]['identity'].get('name', 'Unknown')
                    label = f'NO ID - {name}'
                violation_idx += 1

            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 3)
            # Label background
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
            cv2.rectangle(frame, (x1, y1 - th - 10), (x1 + tw, y1), color, -1)
            cv2.putText(frame, label, (x1, y1 - 5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

        return frame

    def process_video(self, source=0, output_path=None, display=True):
        """Process video stream (webcam or file).

        Args:
            source: Video source (0 for webcam, or path to video file).
            output_path: Optional path to save output video.
            display: Whether to show live display.
        """
        cap = cv2.VideoCapture(source)
        if not cap.isOpened():
            print(f"[Pipeline] ERROR: Cannot open video source: {source}")
            return

        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        writer = None
        if output_path:
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            writer = cv2.VideoWriter(output_path, fourcc, fps, (w, h))

        frame_count = 0
        total_time = 0

        print(f"[Pipeline] Processing video: {source} ({w}x{h} @ {fps}fps)")
        print("[Pipeline] Press 'q' to quit")

        try:
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break

                start = time.time()
                result = self.process_frame(frame)
                elapsed = time.time() - start
                total_time += elapsed
                frame_count += 1

                current_fps = 1.0 / elapsed if elapsed > 0 else 0
                annotated = result['annotated_frame']

                # Draw FPS
                cv2.putText(annotated, f'FPS: {current_fps:.1f}', (10, 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)

                # Log violations
                for v in result['violations']:
                    name = v.get('identity', {}).get('name', 'Unknown') if v.get('identity') else 'No Face'
                    print(f"  [ALERT] Violation at {v['timestamp']} — {name}")

                if writer:
                    writer.write(annotated)

                if display:
                    cv2.imshow('Smart ID Card Detection', annotated)
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break
        finally:
            cap.release()
            if writer:
                writer.release()
            if display:
                cv2.destroyAllWindows()

        avg_fps = frame_count / total_time if total_time > 0 else 0
        print(f"[Pipeline] Done. {frame_count} frames, avg {avg_fps:.1f} FPS")

    def process_image(self, image_path):
        """Process a single image.

        Args:
            image_path: Path to input image.

        Returns:
            Same as process_frame().
        """
        frame = cv2.imread(image_path)
        if frame is None:
            print(f"[Pipeline] ERROR: Cannot read image: {image_path}")
            return None
        return self.process_frame(frame)


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Smart ID Card Detection Pipeline')
    parser.add_argument('--model', type=str, required=True, help='Path to trained model (.pt)')
    parser.add_argument('--source', type=str, default='0', help='Video source (0=webcam, or video path)')
    parser.add_argument('--faces', type=str, default='face_db', help='Face database directory')
    parser.add_argument('--conf', type=float, default=0.5, help='Detection confidence threshold')
    parser.add_argument('--output', type=str, default=None, help='Output video path')
    parser.add_argument('--no-display', action='store_true', help='Disable live display')
    args = parser.parse_args()

    pipeline = SmartIDPipeline(
        model_path=args.model,
        face_db_dir=args.faces,
        conf_threshold=args.conf,
    )

    source = int(args.source) if args.source.isdigit() else args.source
    pipeline.process_video(source=source, output_path=args.output, display=not args.no_display)


if __name__ == '__main__':
    main()
