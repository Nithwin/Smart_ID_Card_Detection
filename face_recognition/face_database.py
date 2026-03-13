"""
Face Embedding Database
========================
Maintains a database of known face embeddings for identification.
"""

import os
import json
import numpy as np
import cv2
from pathlib import Path
from datetime import datetime


class FaceDatabase:
    """Manages a database of face embeddings for recognition."""

    def __init__(self, db_dir='face_db', similarity_threshold=0.5):
        """
        Args:
            db_dir: Directory to store face images and embeddings.
            similarity_threshold: Minimum cosine similarity for a match.
        """
        self.db_dir = Path(db_dir)
        self.db_dir.mkdir(parents=True, exist_ok=True)
        self.similarity_threshold = similarity_threshold

        # In-memory database: {person_id: {'name': str, 'embeddings': [np.array]}}
        self.database = {}
        self._load_database()

    def _embeddings_path(self):
        return self.db_dir / 'embeddings.npz'

    def _metadata_path(self):
        return self.db_dir / 'metadata.json'

    def _load_database(self):
        """Load existing embeddings from disk."""
        meta_path = self._metadata_path()
        emb_path = self._embeddings_path()

        if meta_path.exists() and emb_path.exists():
            with open(meta_path, 'r') as f:
                metadata = json.load(f)

            data = np.load(str(emb_path), allow_pickle=True)

            for person_id, info in metadata.items():
                emb_key = f'emb_{person_id}'
                if emb_key in data:
                    self.database[person_id] = {
                        'name': info['name'],
                        'embeddings': [data[emb_key][i] for i in range(len(data[emb_key]))],
                    }

            print(f"[FaceDB] Loaded {len(self.database)} persons from {self.db_dir}")
        else:
            print(f"[FaceDB] No existing database found. Starting fresh at {self.db_dir}")

    def save_database(self):
        """Persist database to disk."""
        metadata = {}
        emb_dict = {}

        for person_id, info in self.database.items():
            metadata[person_id] = {'name': info['name']}
            emb_dict[f'emb_{person_id}'] = np.array(info['embeddings'])

        with open(self._metadata_path(), 'w') as f:
            json.dump(metadata, f, indent=2)

        np.savez(str(self._embeddings_path()), **emb_dict)
        print(f"[FaceDB] Saved {len(self.database)} persons to {self.db_dir}")

    def register_face(self, person_id, name, embedding, face_image=None):
        """Register a new face or add embedding to existing person.

        Args:
            person_id: Unique identifier for the person.
            name: Display name.
            embedding: 512-d face embedding vector.
            face_image: Optional face image to save for reference.
        """
        if person_id not in self.database:
            self.database[person_id] = {'name': name, 'embeddings': []}

        self.database[person_id]['embeddings'].append(np.asarray(embedding, dtype=np.float32))
        self.database[person_id]['name'] = name

        # Save reference face image
        if face_image is not None:
            person_dir = self.db_dir / person_id
            person_dir.mkdir(exist_ok=True)
            count = len(list(person_dir.glob('*.jpg')))
            cv2.imwrite(str(person_dir / f'face_{count}.jpg'), face_image)

        self.save_database()
        print(f"[FaceDB] Registered face for {name} (ID: {person_id}), "
              f"total embeddings: {len(self.database[person_id]['embeddings'])}")

    def identify(self, embedding):
        """Find the best matching person for a given face embedding.

        Args:
            embedding: 512-d face embedding to search for.

        Returns:
            dict: {'person_id': str, 'name': str, 'similarity': float} or None
        """
        if not self.database:
            return None

        query = np.asarray(embedding, dtype=np.float32).flatten()
        best_match = None
        best_similarity = -1.0

        for person_id, info in self.database.items():
            for stored_emb in info['embeddings']:
                stored = np.asarray(stored_emb, dtype=np.float32).flatten()
                dot = np.dot(query, stored)
                norm = np.linalg.norm(query) * np.linalg.norm(stored)
                if norm == 0:
                    continue
                similarity = float(dot / norm)

                if similarity > best_similarity:
                    best_similarity = similarity
                    best_match = {
                        'person_id': person_id,
                        'name': info['name'],
                        'similarity': similarity,
                    }

        if best_match and best_match['similarity'] >= self.similarity_threshold:
            return best_match
        return None

    def register_from_directory(self, images_dir, face_pipeline):
        """Bulk register faces from a directory structure.

        Expected structure:
            images_dir/
                person_001/
                    photo1.jpg
                    photo2.jpg
                person_002/
                    photo1.jpg

        Args:
            images_dir: Path to the root directory.
            face_pipeline: FacePipeline instance for face detection.
        """
        images_dir = Path(images_dir)
        for person_dir in sorted(images_dir.iterdir()):
            if not person_dir.is_dir():
                continue

            person_id = person_dir.name
            name = person_id.replace('_', ' ').title()

            for img_path in person_dir.glob('*.jpg'):
                img = cv2.imread(str(img_path))
                if img is None:
                    continue

                faces = face_pipeline.app.get(img) if face_pipeline.app else []
                for face in faces:
                    self.register_face(person_id, name, face.normed_embedding, img)
                    break  # One face per image

        print(f"[FaceDB] Bulk registration complete. {len(self.database)} persons registered.")
