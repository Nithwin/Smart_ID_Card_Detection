"""
Smart ID Card Detection — Flask Web Application
=================================================
Real-time monitoring dashboard with live camera feed and alerts.
"""

import os
import sys
import cv2
import time
import json
import base64
import threading
from pathlib import Path
from datetime import datetime
from flask import Flask, render_template, Response, jsonify, request
from flask_cors import CORS

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

app = Flask(__name__)
CORS(app)

# Global state
pipeline = None
alert_log = []
stats = {'total_frames': 0, 'total_violations': 0, 'total_compliant': 0}
camera_lock = threading.Lock()


def init_pipeline(model_path='best.pt', face_db_dir='face_db'):
    """Initialize the detection pipeline."""
    global pipeline
    from inference.pipeline import SmartIDPipeline
    pipeline = SmartIDPipeline(model_path=model_path, face_db_dir=face_db_dir)
    print("[WebApp] Pipeline initialized.")


def generate_frames(source=0):
    """Generator that yields JPEG frames for the video stream."""
    global stats

    cap = cv2.VideoCapture(source)
    if not cap.isOpened():
        print(f"[WebApp] Cannot open camera source: {source}")
        return

    while True:
        with camera_lock:
            ret, frame = cap.read()

        if not ret:
            break

        if pipeline:
            result = pipeline.process_frame(frame)
            annotated = result['annotated_frame']

            stats['total_frames'] += 1
            for c in result['compliance']:
                if c['compliant']:
                    stats['total_compliant'] += 1
                else:
                    stats['total_violations'] += 1

            # Log violations
            for v in result['violations']:
                alert_entry = {
                    'timestamp': v['timestamp'],
                    'identity': v.get('identity', {}).get('name', 'Unknown') if v.get('identity') else 'No Face',
                    'face_image': None,
                }
                if v.get('face_image') is not None:
                    _, buf = cv2.imencode('.jpg', v['face_image'])
                    alert_entry['face_image'] = base64.b64encode(buf).decode('utf-8')
                alert_log.append(alert_entry)
                # Keep only last 500 alerts
                if len(alert_log) > 500:
                    alert_log.pop(0)
        else:
            annotated = frame

        _, buffer = cv2.imencode('.jpg', annotated)
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')


# ===== Routes =====

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/alerts')
def alerts_page():
    return render_template('alerts.html')


@app.route('/video_feed')
def video_feed():
    source = request.args.get('source', '0')
    source = int(source) if source.isdigit() else source
    return Response(generate_frames(source),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/api/stats')
def api_stats():
    compliance_rate = 0
    total = stats['total_compliant'] + stats['total_violations']
    if total > 0:
        compliance_rate = round(stats['total_compliant'] / total * 100, 1)
    return jsonify({
        **stats,
        'compliance_rate': compliance_rate,
        'active_alerts': len([a for a in alert_log[-50:]]),
    })


@app.route('/api/alerts')
def api_alerts():
    limit = request.args.get('limit', 50, type=int)
    return jsonify(alert_log[-limit:])


@app.route('/api/alerts/clear', methods=['POST'])
def clear_alerts():
    global alert_log
    alert_log = []
    return jsonify({'status': 'cleared'})


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Smart ID Card Detection Web App')
    parser.add_argument('--model', type=str, default='best.pt', help='Model path')
    parser.add_argument('--faces', type=str, default='face_db', help='Face database directory')
    parser.add_argument('--port', type=int, default=5000, help='Server port')
    parser.add_argument('--host', type=str, default='0.0.0.0', help='Server host')
    args = parser.parse_args()

    init_pipeline(model_path=args.model, face_db_dir=args.faces)
    app.run(host=args.host, port=args.port, debug=False, threaded=True)
