"""
SQLite Database for Smart ID Card Detection
============================================
Stores alerts (violations) with face images and detection metadata.
"""

import sqlite3
import threading
from pathlib import Path
from datetime import datetime
from contextlib import contextmanager

DB_PATH = Path(__file__).parent / "detections.db"

_local = threading.local()


def _get_conn() -> sqlite3.Connection:
    """Get a thread-local SQLite connection."""
    if not hasattr(_local, "conn") or _local.conn is None:
        _local.conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
        _local.conn.row_factory = sqlite3.Row
        _local.conn.execute("PRAGMA journal_mode=WAL")
        _local.conn.execute("PRAGMA synchronous=NORMAL")
    return _local.conn


@contextmanager
def get_db():
    conn = _get_conn()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise


def init_db():
    """Create tables if they don't exist."""
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS alerts (
                id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                person_box TEXT,
                face_detected INTEGER DEFAULT 0,
                face_image_path TEXT,
                identified_name TEXT,
                similarity REAL DEFAULT 0.0,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp);
            CREATE INDEX IF NOT EXISTS idx_alerts_name ON alerts(identified_name);

            CREATE TABLE IF NOT EXISTS stats (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                total_frames INTEGER DEFAULT 0,
                total_detections INTEGER DEFAULT 0,
                violations INTEGER DEFAULT 0,
                compliant INTEGER DEFAULT 0,
                identified INTEGER DEFAULT 0
            );

            INSERT OR IGNORE INTO stats (id, total_frames, total_detections, violations, compliant, identified)
            VALUES (1, 0, 0, 0, 0, 0);
        """)


def insert_alert(alert_id: str, timestamp: str, person_box: str,
                 face_detected: bool, face_image_path: str | None,
                 identified_name: str | None, similarity: float):
    with get_db() as conn:
        conn.execute(
            """INSERT INTO alerts (id, timestamp, person_box, face_detected,
               face_image_path, identified_name, similarity)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (alert_id, timestamp, person_box, int(face_detected),
             face_image_path, identified_name, similarity),
        )


def get_alerts(limit: int = 50, offset: int = 0, name: str | None = None) -> tuple[list[dict], int]:
    with get_db() as conn:
        if name:
            rows = conn.execute(
                "SELECT * FROM alerts WHERE identified_name = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?",
                (name, limit, offset),
            ).fetchall()
            total = conn.execute(
                "SELECT COUNT(*) FROM alerts WHERE identified_name = ?", (name,)
            ).fetchone()[0]
        else:
            rows = conn.execute(
                "SELECT * FROM alerts ORDER BY timestamp DESC LIMIT ? OFFSET ?",
                (limit, offset),
            ).fetchall()
            total = conn.execute("SELECT COUNT(*) FROM alerts").fetchone()[0]
    return [dict(r) for r in rows], total


def clear_alerts():
    with get_db() as conn:
        conn.execute("DELETE FROM alerts")


def update_stats(frames: int = 0, detections: int = 0, violations: int = 0,
                 compliant: int = 0, identified: int = 0):
    with get_db() as conn:
        conn.execute(
            """UPDATE stats SET
               total_frames = total_frames + ?,
               total_detections = total_detections + ?,
               violations = violations + ?,
               compliant = compliant + ?,
               identified = identified + ?
               WHERE id = 1""",
            (frames, detections, violations, compliant, identified),
        )


def get_stats() -> dict:
    with get_db() as conn:
        row = conn.execute("SELECT * FROM stats WHERE id = 1").fetchone()
    if row is None:
        return {"total_frames": 0, "total_detections": 0, "violations": 0, "compliant": 0, "identified": 0}
    d = dict(row)
    d.pop("id", None)
    return d


def reset_stats():
    with get_db() as conn:
        conn.execute(
            "UPDATE stats SET total_frames=0, total_detections=0, violations=0, compliant=0, identified=0 WHERE id=1"
        )
