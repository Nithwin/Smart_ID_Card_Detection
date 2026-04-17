"""
Smart ID Card Detection — FastAPI Backend
==========================================
Endpoints:
  POST /api/detect              — Upload image, get detections
  POST /api/detect-video        — Upload video, process frames
  GET  /api/camera/start        — Start backend camera capture
  GET  /api/camera/stop         — Stop backend camera capture
  GET  /api/camera/feed         — MJPEG stream of annotated camera feed
  GET  /api/camera/status       — Camera status
  GET  /api/stats               — Dashboard statistics
  GET  /api/alerts              — Recent violation alerts
  POST /api/faces/register      — Register a new face (with InsightFace embedding)
  GET  /api/faces               — List registered faces
  DELETE /api/faces/{person_id} — Remove a registered face
  GET  /api/known-faces         — List known faces from known_faces/ directory
"""

import os
import sys
import uuid
import time
import json
import base64
import threading
from io import BytesIO
from pathlib import Path
from datetime import datetime
from typing import Optional
from contextlib import asynccontextmanager

import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, StreamingResponse
import aiofiles

from database import init_db, insert_alert, get_alerts as db_get_alerts, clear_alerts as db_clear_alerts, update_stats, get_stats as db_get_stats, reset_stats

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

# ---------------------------------------------------------------------------
# Globals
# ---------------------------------------------------------------------------
detector = None         # YOLO model
face_detector = None    # MediaPipe face detection
face_app = None         # InsightFace for recognition embeddings
known_faces_db = {}     # {name: [embedding, ...]}
alerts_log: list[dict] = []  # in-memory cache for recent camera alerts

# Alert deduplication: track recently alerted persons to avoid spam
# {identified_name_or_box_key: last_alert_timestamp}
_recent_alerts: dict[str, float] = {}
ALERT_COOLDOWN = 30  # seconds — same person won't be re-alerted within this window

# Camera globals
camera_lock = threading.Lock()
camera_cap = None
camera_running = False
latest_annotated_frame = None
latest_raw_frame = None

UPLOAD_DIR = Path(__file__).parent / "uploads"
FACE_DB_DIR = Path(__file__).parent / "face_db"
ALERTS_DIR = Path(__file__).parent / "alert_images"
KNOWN_FACES_DIR = Path(__file__).parent / "known_faces"
MODEL_PATH = os.environ.get("MODEL_PATH", str(PROJECT_ROOT / "models" / "best.pt"))

SIMILARITY_THRESHOLD = 0.4


# ---------------------------------------------------------------------------
# Face Recognition Helpers
# ---------------------------------------------------------------------------
def load_known_faces():
    """Load known faces from known_faces/ directory. Filename (without ext) = person name."""
    global known_faces_db
    if face_app is None:
        print("[FaceRecog] InsightFace not available, skipping known faces")
        return

    KNOWN_FACES_DIR.mkdir(parents=True, exist_ok=True)
    known_faces_db = {}

    for img_path in sorted(KNOWN_FACES_DIR.iterdir()):
        if img_path.suffix.lower() not in ('.jpg', '.jpeg', '.png', '.webp'):
            continue
        name = img_path.stem.replace('_', ' ').title()
        img = cv2.imread(str(img_path))
        if img is None:
            print(f"[FaceRecog] Could not read {img_path}")
            continue

        faces = face_app.get(img)
        if faces:
            face = max(faces, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]))
            emb = face.normed_embedding
            if name not in known_faces_db:
                known_faces_db[name] = []
            known_faces_db[name].append(emb)
            print(f"[FaceRecog] Loaded face: {name}")
        else:
            print(f"[FaceRecog] No face found in {img_path.name}")

    print(f"[FaceRecog] {len(known_faces_db)} known persons loaded")


def identify_face(face_crop: np.ndarray) -> tuple[str | None, float, np.ndarray | None]:
    """Run InsightFace on a crop: detect face + extract embedding + match.

    Returns (name, similarity, aligned_face_crop) or (None, 0.0, None).
    """
    if face_app is None or not known_faces_db:
        return None, 0.0, None

    faces = face_app.get(face_crop)
    if not faces:
        return None, 0.0, None

    face = max(faces, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]))
    query_emb = face.normed_embedding

    # Get face bbox for cropping
    bx1, by1, bx2, by2 = face.bbox.astype(int)
    bx1, by1 = max(0, bx1), max(0, by1)
    bx2 = min(face_crop.shape[1], bx2)
    by2 = min(face_crop.shape[0], by2)
    face_img = face_crop[by1:by2, bx1:bx2] if (bx2 > bx1 and by2 > by1) else None

    best_name = None
    best_sim = -1.0

    for name, embeddings in known_faces_db.items():
        for stored_emb in embeddings:
            sim = float(np.dot(query_emb, stored_emb))
            if sim > best_sim:
                best_sim = sim
                best_name = name

    if best_sim >= SIMILARITY_THRESHOLD:
        return best_name, round(best_sim, 3), face_img
    return None, round(best_sim, 3), face_img


# ---------------------------------------------------------------------------
# Model Loading
# ---------------------------------------------------------------------------
def load_models():
    global detector, face_detector, face_app

    # Fix PyTorch 2.6+ weights_only issue
    import torch
    _original_load = torch.load
    def _patched_load(*args, **kwargs):
        kwargs["weights_only"] = False
        return _original_load(*args, **kwargs)
    torch.load = _patched_load

    # YOLO model
    from ultralytics import YOLO
    try:
        from custom_modules.register import register_custom_modules
        register_custom_modules()
    except ImportError:
        pass
    detector = YOLO(MODEL_PATH)
    print(f"[Backend] YOLO loaded: {MODEL_PATH}")

    # MediaPipe face detection (new tasks API)
    import mediapipe as mp
    model_path = Path(__file__).parent / "blaze_face_short_range.tflite"
    base_options = mp.tasks.BaseOptions(model_asset_path=str(model_path))
    options = mp.tasks.vision.FaceDetectorOptions(
        base_options=base_options,
        min_detection_confidence=0.5,
    )
    face_detector = mp.tasks.vision.FaceDetector.create_from_options(options)
    print("[Backend] MediaPipe face detection loaded")

    # InsightFace for recognition
    try:
        from insightface.app import FaceAnalysis
        face_app = FaceAnalysis(name='buffalo_l', providers=['CUDAExecutionProvider', 'CPUExecutionProvider'])
        face_app.prepare(ctx_id=0, det_size=(320, 320))
        print("[Backend] InsightFace loaded for face recognition")
    except Exception as e:
        print(f"[Backend] InsightFace failed to load: {e}. Face recognition disabled.")
        face_app = None

    # Load known faces
    load_known_faces()


@asynccontextmanager
async def lifespan(app: FastAPI):
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    ALERTS_DIR.mkdir(parents=True, exist_ok=True)
    FACE_DB_DIR.mkdir(parents=True, exist_ok=True)
    KNOWN_FACES_DIR.mkdir(parents=True, exist_ok=True)
    init_db()
    load_models()
    yield
    stop_camera_capture()


app = FastAPI(title="Smart ID Card Detection API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALERTS_DIR.mkdir(parents=True, exist_ok=True)
FACE_DB_DIR.mkdir(parents=True, exist_ok=True)
KNOWN_FACES_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
app.mount("/alert_images", StaticFiles(directory=str(ALERTS_DIR)), name="alert_images")
app.mount("/face_db", StaticFiles(directory=str(FACE_DB_DIR)), name="face_db")
app.mount("/known_faces", StaticFiles(directory=str(KNOWN_FACES_DIR)), name="known_faces")


# ---------------------------------------------------------------------------
# Core Detection Logic
# ---------------------------------------------------------------------------
def decode_image(data: bytes) -> np.ndarray:
    arr = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image")
    return img


def detect_faces_mp(frame: np.ndarray) -> list[dict]:
    import mediapipe as mp
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    results = face_detector.detect(mp_image)
    faces = []
    h, w = frame.shape[:2]
    for det in results.detections:
        bb = det.bounding_box
        x1 = max(0, bb.origin_x)
        y1 = max(0, bb.origin_y)
        x2 = min(w, bb.origin_x + bb.width)
        y2 = min(h, bb.origin_y + bb.height)
        score = det.categories[0].score if det.categories else 0.0
        faces.append({"box": [x1, y1, x2, y2], "confidence": round(float(score), 3)})
    return faces


def run_detection(frame: np.ndarray, conf: float = 0.5, is_camera: bool = False) -> dict:
    """Full pipeline: YOLO → compliance check → InsightFace identify.

    Args:
        is_camera: If True, applies alert deduplication (one alert per person per cooldown).
    """
    global stats
    t0 = time.time()
    now = time.time()

    # 1) YOLO — downscale large frames for speed
    h_orig, w_orig = frame.shape[:2]
    scale = 1.0
    proc_frame = frame
    if max(h_orig, w_orig) > 640:
        scale = 640 / max(h_orig, w_orig)
        proc_frame = cv2.resize(frame, (int(w_orig * scale), int(h_orig * scale)))

    yolo_res = detector(proc_frame, conf=conf, verbose=False)[0]
    persons, cards = [], []
    for box in yolo_res.boxes:
        xyxy = box.xyxy[0].cpu().numpy().tolist()
        # Scale boxes back to original resolution
        xyxy = [v / scale for v in xyxy]
        c = float(box.conf[0])
        cls = int(box.cls[0])
        entry = {"box": [round(v, 1) for v in xyxy], "confidence": round(c, 3), "class": cls}
        (cards if cls == 0 else persons).append(entry)

    # 2) Compliance check
    compliance = []
    for person in persons:
        px1, py1, px2, py2 = person["box"]
        ph = py2 - py1
        has_card = False
        matched_card = None
        for card in cards:
            cx = (card["box"][0] + card["box"][2]) / 2
            cy = (card["box"][1] + card["box"][3]) / 2
            if px1 <= cx <= px2 and py1 <= cy <= py1 + 0.7 * ph:
                has_card = True
                matched_card = card
                break
        compliance.append({"person": person, "compliant": has_card, "card": matched_card})

    # 3) Face recognition via InsightFace (single pass — no MediaPipe needed)
    all_faces_info = []
    for entry in compliance:
        px1, py1, px2, py2 = [int(v) for v in entry["person"]["box"]]  # type: ignore
        # Clamp to frame bounds
        px1, py1 = max(0, px1), max(0, py1)
        px2, py2 = min(w_orig, px2), min(h_orig, py2)
        person_crop = frame[py1:py2, px1:px2]
        face_img_b64 = None
        identified_name = None
        similarity = 0.0
        face_detected = False

        if person_crop.size > 100:
            identified_name, similarity, face_img = identify_face(person_crop)
            if face_img is not None and face_img.size > 0:
                face_detected = True
                _, buf = cv2.imencode(".jpg", face_img, [cv2.IMWRITE_JPEG_QUALITY, 80])
                face_img_b64 = base64.b64encode(buf).decode()

        all_faces_info.append({
            "person_box": entry["person"]["box"],
            "compliant": entry["compliant"],
            "face_detected": face_detected,
            "face_image": face_img_b64,
            "identified_name": identified_name,
            "similarity": similarity,
        })

    # 4) Stats
    n_ok = sum(1 for c in compliance if c["compliant"])
    n_bad = sum(1 for c in compliance if not c["compliant"])
    n_identified = sum(1 for f in all_faces_info if f["identified_name"])
    update_stats(frames=1, detections=len(persons) + len(cards),
                 violations=n_bad, compliant=n_ok, identified=n_identified)

    # 5) Alert log — with deduplication
    for f in all_faces_info:
        if not f["compliant"]:
            # Build a dedup key: use identified name, or fall back to box region
            dedup_key = f["identified_name"] or f"box_{int(f['person_box'][0])}_{int(f['person_box'][1])}"

            # Check if this person was already alerted recently
            last_alert = _recent_alerts.get(dedup_key, 0)
            if (now - last_alert) < ALERT_COOLDOWN:
                continue  # Skip — already alerted recently

            _recent_alerts[dedup_key] = now

            alert_entry = {
                "id": str(uuid.uuid4())[:8],
                "timestamp": datetime.now().isoformat(),
                "person_box": f["person_box"],
                "face_detected": f["face_detected"],
                "face_image": f["face_image"],
                "identified_name": f["identified_name"],
                "similarity": f["similarity"],
            }
            alerts_log.append(alert_entry)

            # Save alert face image to disk
            face_image_path = None
            if f["face_image"]:
                face_bytes = base64.b64decode(f["face_image"])
                face_image_path = f"{alert_entry['id']}.jpg"
                with open(str(ALERTS_DIR / face_image_path), "wb") as fp:
                    fp.write(face_bytes)

            # Persist to SQLite
            insert_alert(
                alert_id=alert_entry["id"],
                timestamp=alert_entry["timestamp"],
                person_box=json.dumps(f["person_box"]),
                face_detected=f["face_detected"],
                face_image_path=face_image_path,
                identified_name=f["identified_name"],
                similarity=f["similarity"],
            )

    if len(alerts_log) > 500:
        del alerts_log[:len(alerts_log)-500]

    # Clean old dedup entries
    for k in list(_recent_alerts):
        if now - _recent_alerts[k] > ALERT_COOLDOWN * 2:
            del _recent_alerts[k]

    inference_ms = round((time.time() - t0) * 1000, 1)

    # 6) Annotated image
    annotated = frame.copy()
    for i, entry in enumerate(compliance):
        px1, py1, px2, py2 = [int(v) for v in entry["person"]["box"]]
        ok = entry["compliant"]
        face_info = all_faces_info[i]
        color = (0, 200, 0) if ok else (0, 0, 220)

        # Build label
        if face_info["identified_name"]:
            name_str = face_info["identified_name"]
            label = f"{name_str} - {'OK' if ok else 'NO ID'}"
        else:
            label = "COMPLIANT" if ok else "VIOLATION"

        cv2.rectangle(annotated, (px1, py1), (px2, py2), color, 2)
        # Label background
        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
        cv2.rectangle(annotated, (px1, py1-th-10), (px1+tw+6, py1), color, -1)
        cv2.putText(annotated, label, (px1+3, py1-5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,255), 2)

        # Show similarity score if identified
        if face_info["identified_name"]:
            sim_text = f"{face_info['similarity']:.0%}"
            cv2.putText(annotated, sim_text, (px1+3, py2-8), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

    for card in cards:
        cx1, cy1, cx2, cy2 = [int(v) for v in card["box"]]
        cv2.rectangle(annotated, (cx1, cy1), (cx2, cy2), (255, 180, 0), 2)
        cv2.putText(annotated, "ID Card", (cx1, cy1-8), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,180,0), 2)

    _, buf = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 85])
    annotated_b64 = base64.b64encode(buf).decode()

    return {
        "persons": persons,
        "cards": cards,
        "compliance": [
            {"person_box": c["person"]["box"], "compliant": c["compliant"],
             "card_box": c["card"]["box"] if c["card"] else None,
             "identified_name": all_faces_info[i]["identified_name"],
             "similarity": all_faces_info[i]["similarity"]}
            for i, c in enumerate(compliance)
        ],
        "violators": [
            {"person_box": f["person_box"], "face_detected": f["face_detected"],
             "identified_name": f["identified_name"], "similarity": f["similarity"]}
            for f in all_faces_info if not f["compliant"]
        ],
        "stats": {
            "persons_detected": len(persons), "cards_detected": len(cards),
            "compliant": n_ok, "violations": n_bad,
            "identified": n_identified, "inference_ms": inference_ms,
        },
        "annotated_image": annotated_b64,
    }


# ---------------------------------------------------------------------------
# Camera — runs in a background thread
# ---------------------------------------------------------------------------
def camera_loop():
    global camera_cap, camera_running, latest_annotated_frame, latest_raw_frame
    print("[Camera] Thread started")
    frame_count: int = 0
    last_result_bytes = None
    while camera_running:
        with camera_lock:
            if camera_cap is None or not camera_cap.isOpened():
                break
            ret, frame = camera_cap.read()
        if not ret:
            time.sleep(0.01)
            continue

        frame_count += 1
        # Process every 3rd frame for speed — show last result for skipped frames
        if frame_count % 3 != 0 and last_result_bytes is not None:
            latest_annotated_frame = last_result_bytes
            continue

        latest_raw_frame = frame
        result = run_detection(frame, conf=0.5, is_camera=True)
        annotated_bytes = base64.b64decode(result["annotated_image"])
        latest_annotated_frame = annotated_bytes
        last_result_bytes = annotated_bytes
    print("[Camera] Thread stopped")


def start_camera_capture(device=0):
    """Start camera. device can be int (index) or str (URL / IP cam)."""
    global camera_cap, camera_running
    if camera_running:
        return
    camera_cap = cv2.VideoCapture(device)
    if not camera_cap.isOpened():
        raise RuntimeError(f"Cannot open camera: {device}")
    camera_cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    camera_cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    camera_running = True
    t = threading.Thread(target=camera_loop, daemon=True)
    t.start()
    print(f"[Camera] Started on {device}")


def stop_camera_capture():
    global camera_cap, camera_running, latest_annotated_frame
    camera_running = False
    time.sleep(0.1)
    with camera_lock:
        if camera_cap is not None:
            camera_cap.release()
            camera_cap = None
    latest_annotated_frame = None
    print("[Camera] Stopped")


def mjpeg_generator():
    """Yield MJPEG frames for streaming."""
    while camera_running:
        if latest_annotated_frame is not None:
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n"
                + latest_annotated_frame
                + b"\r\n"
            )
        time.sleep(0.03)  # ~30 fps cap


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@app.get("/api/health")
async def health():
    return {"status": "ok", "model": MODEL_PATH}


@app.post("/api/detect")
async def detect_image(file: UploadFile = File(...), confidence: float = 0.5):
    data = await file.read()
    try:
        frame = decode_image(data)
    except ValueError:
        raise HTTPException(400, "Invalid image")
    return run_detection(frame, conf=confidence)


@app.post("/api/detect-video")
async def detect_video(file: UploadFile = File(...), confidence: float = 0.5, sample_rate: int = 5):
    video_id = str(uuid.uuid4())[:8]
    video_path = UPLOAD_DIR / f"{video_id}.mp4"
    async with aiofiles.open(str(video_path), "wb") as f:
        await f.write(await file.read())

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        os.remove(str(video_path))
        raise HTTPException(400, "Cannot open video")

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_results = []
    idx = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if idx % sample_rate == 0:
            r = run_detection(frame, conf=confidence)
            frame_results.append({
                "frame": idx,
                "time_sec": round(idx / fps, 2) if fps > 0 else 0,
                "stats": r["stats"],
                "compliance": r["compliance"],
                "violators": r["violators"],
            })
        idx += 1

    cap.release()
    os.remove(str(video_path))

    return {
        "video_info": {"total_frames": total_frames, "fps": round(fps, 1), "frames_processed": len(frame_results)},
        "summary": {
            "total_violations": sum(r["stats"]["violations"] for r in frame_results),
            "total_compliant": sum(r["stats"]["compliant"] for r in frame_results),
        },
        "frames": frame_results,
    }


# --- Camera Endpoints ---

# Common mobile camera app URLs to auto-detect
_MOBILE_CAM_PRESETS = [
    {"name": "DroidCam (USB)", "url": "http://localhost:4747/video"},
    {"name": "DroidCam (WiFi)", "url": "http://{ip}:4747/video"},
    {"name": "IP Webcam", "url": "http://{ip}:8080/video"},
    {"name": "Iriun Webcam", "url": "http://{ip}:8554/video"},
]

# Default IP camera URL from environment
DEFAULT_IP_CAM = os.environ.get("IP_CAMERA_URL", "")


def _probe_url(url: str, timeout: float = 2.0) -> bool:
    """Try to open a video URL and return True if it works."""
    cap = cv2.VideoCapture(url)
    cap.set(cv2.CAP_PROP_OPEN_TIMEOUT_MSEC, int(timeout * 1000))
    opened = cap.isOpened()
    if opened:
        ret, _ = cap.read()
        cap.release()
        return ret
    return False


def _get_local_ips() -> list[str]:
    """Get IPs of devices on the local network (common phone tethering ranges)."""
    import socket
    ips = []
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        my_ip = s.getsockname()[0]
        s.close()
        base = ".".join(my_ip.split(".")[:3])
        for last in range(1, 20):
            ip = f"{base}.{last}"
            if ip != my_ip:
                ips.append(ip)
    except Exception:
        pass
    # Common USB tethering IP ranges
    ips.extend(["192.168.42.129", "192.168.43.1", "172.16.0.2"])
    return ips


@app.get("/api/camera/devices")
async def api_camera_devices():
    """List available camera devices (indices 0-9)."""
    devices = []
    for i in range(10):
        cap = cv2.VideoCapture(i)
        if cap.isOpened():
            w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            devices.append({"index": i, "name": f"Camera {i}", "resolution": f"{w}x{h}"})
            cap.release()
        else:
            break  # stop at first unavailable index
    return {"devices": devices}


@app.get("/api/camera/test-url")
async def api_camera_test_url(url: str = Query(...)):
    """Test if a camera URL is reachable and returns frames."""
    ok = _probe_url(url, timeout=3.0)
    return {"url": url, "reachable": ok}


@app.get("/api/camera/auto-detect")
async def api_camera_auto_detect():
    """Auto-detect mobile camera apps on USB and local network."""
    found = []

    # 1) Try localhost URLs first (USB-connected apps)
    for preset in _MOBILE_CAM_PRESETS:
        if "{ip}" not in preset["url"]:
            url = preset["url"]
            if _probe_url(url, timeout=2.0):
                found.append({"name": preset["name"], "url": url})

    # 2) Try env variable
    if DEFAULT_IP_CAM and _probe_url(DEFAULT_IP_CAM, timeout=2.0):
        found.append({"name": "ENV: IP_CAMERA_URL", "url": DEFAULT_IP_CAM})

    # 3) Try common network IPs (quick scan)
    if not found:
        local_ips = _get_local_ips()
        for preset in _MOBILE_CAM_PRESETS:
            if "{ip}" in preset["url"]:
                for ip in local_ips[:8]:
                    url = preset["url"].replace("{ip}", ip)
                    if _probe_url(url, timeout=1.5):
                        found.append({"name": f"{preset['name']} ({ip})", "url": url})
                        break

    return {"cameras": found, "default_url": DEFAULT_IP_CAM}

@app.get("/api/camera/start")
async def api_camera_start(device: int = Query(0), url: str = Query(None)):
    try:
        source = url if url else device
        start_camera_capture(source)
        return {"status": "started", "device": str(source)}
    except RuntimeError as e:
        raise HTTPException(500, str(e))


@app.get("/api/camera/stop")
async def api_camera_stop():
    stop_camera_capture()
    return {"status": "stopped"}


@app.get("/api/camera/status")
async def api_camera_status():
    return {"running": camera_running}


@app.get("/api/camera/feed")
async def api_camera_feed():
    if not camera_running:
        raise HTTPException(400, "Camera not running. Call /api/camera/start first.")
    return StreamingResponse(mjpeg_generator(), media_type="multipart/x-mixed-replace; boundary=frame")


# --- Stats & Alerts ---

@app.get("/api/stats")
async def api_get_stats():
    s = db_get_stats()
    return {**s, "known_persons": len(known_faces_db)}


@app.get("/api/alerts")
async def api_get_alerts(limit: int = 50, offset: int = 0, name: str | None = None):
    alerts, total = db_get_alerts(limit=limit, offset=offset, name=name)
    # Reconstruct face_image base64 from saved files for API response
    for a in alerts:
        a["face_image"] = None
        if a.get("face_image_path"):
            img_path = ALERTS_DIR / a["face_image_path"]
            if img_path.exists():
                a["face_image"] = base64.b64encode(img_path.read_bytes()).decode()
        # Parse person_box back from JSON string
        if isinstance(a.get("person_box"), str):
            import json as _json
            a["person_box"] = _json.loads(a["person_box"])
    return {"alerts": alerts, "total": total}


@app.delete("/api/alerts")
async def api_clear_alerts():
    db_clear_alerts()
    alerts_log.clear()
    return {"status": "cleared"}


@app.delete("/api/stats/reset")
async def api_reset_stats():
    reset_stats()
    return {"status": "reset"}


# --- Face Registration ---

@app.post("/api/faces/register")
async def register_face(name: str = Form(...), file: UploadFile = File(...)):
    """Register a face: saves to known_faces/ and reloads the database."""
    data = await file.read()
    frame = decode_image(data)

    # Validate face exists
    faces = detect_faces_mp(frame)
    if not faces:
        raise HTTPException(400, "No face detected in the image")

    # Save to known_faces dir with name as filename
    safe_name = name.strip().replace(' ', '_').lower()
    ext = ".jpg"
    save_path = KNOWN_FACES_DIR / f"{safe_name}{ext}"
    # If name already exists, append number
    counter = 1
    while save_path.exists():
        save_path = KNOWN_FACES_DIR / f"{safe_name}_{counter}{ext}"
        counter += 1

    cv2.imwrite(str(save_path), frame)

    # Also save cropped face for display
    pid = str(uuid.uuid4())[:8]
    best = max(faces, key=lambda f: (f["box"][2]-f["box"][0])*(f["box"][3]-f["box"][1]))
    fx1, fy1, fx2, fy2 = best["box"]
    face_crop = frame[fy1:fy2, fx1:fx2]
    face_path = FACE_DB_DIR / f"{pid}.jpg"
    cv2.imwrite(str(face_path), face_crop)

    # Reload known faces DB
    load_known_faces()

    # Save metadata
    registry_path = FACE_DB_DIR / "registry.json"
    registry = []
    if registry_path.exists():
        with open(registry_path) as f:
            registry = json.load(f)
    registry.append({
        "person_id": pid,
        "name": name.strip(),
        "image": f"{pid}.jpg",
        "source_file": save_path.name,
        "registered_at": datetime.now().isoformat(),
    })
    with open(registry_path, "w") as f:
        json.dump(registry, f, indent=2)

    return {"message": f"Face registered for {name}", "person_id": pid, "image": f"{pid}.jpg",
            "known_persons": len(known_faces_db)}


@app.get("/api/faces")
async def list_faces():
    registry_path = FACE_DB_DIR / "registry.json"
    if not registry_path.exists():
        return {"faces": []}
    with open(registry_path) as f:
        return {"faces": json.load(f)}


@app.get("/api/known-faces")
async def list_known_faces():
    """List all known faces loaded from known_faces/ directory."""
    faces = []
    for img_path in sorted(KNOWN_FACES_DIR.iterdir()):
        if img_path.suffix.lower() not in ('.jpg', '.jpeg', '.png', '.webp'):
            continue
        name = img_path.stem.replace('_', ' ').title()
        faces.append({
            "name": name,
            "filename": img_path.name,
            "image_url": f"/known_faces/{img_path.name}",
            "has_embedding": name in known_faces_db,
        })
    return {"faces": faces, "total": len(faces), "recognition_ready": face_app is not None}


@app.post("/api/known-faces/reload")
async def reload_known_faces():
    """Reload the known faces database from the known_faces/ directory."""
    load_known_faces()
    return {"status": "reloaded", "known_persons": len(known_faces_db)}


@app.delete("/api/faces/{person_id}")
async def delete_face(person_id: str):
    registry_path = FACE_DB_DIR / "registry.json"
    if not registry_path.exists():
        raise HTTPException(404, "No faces registered")
    with open(registry_path) as f:
        registry = json.load(f)
    entry = next((r for r in registry if r["person_id"] == person_id), None)
    if not entry:
        raise HTTPException(404, "Not found")

    new = [r for r in registry if r["person_id"] != person_id]

    # Remove cropped face image
    img_path = FACE_DB_DIR / f"{person_id}.jpg"
    if img_path.exists():
        os.remove(str(img_path))

    # Remove source file from known_faces if present
    if "source_file" in entry:
        src = KNOWN_FACES_DIR / entry["source_file"]
        if src.exists():
            os.remove(str(src))
            load_known_faces()

    with open(registry_path, "w") as f:
        json.dump(new, f, indent=2)
    return {"message": f"Removed {person_id}", "known_persons": len(known_faces_db)}


# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
