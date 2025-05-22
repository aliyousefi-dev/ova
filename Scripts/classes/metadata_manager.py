import os
import json
import cv2
import unicodedata
import hashlib
import shutil
import tempfile
import uuid
import threading
import time


class MetadataManager:
    def __init__(self, video_dir):
        self.VIDEO_DIR = video_dir
        self.METADATA_DIR = os.path.join(video_dir, "metadata")

        self.videos_path = os.path.join(self.METADATA_DIR, "videos.json")
        self.collections_path = os.path.join(self.METADATA_DIR, "collections.json")
        self.favorites_path = os.path.join(self.METADATA_DIR, "favorites.json")

        self.THUMBNAILS_DIR = os.path.join(self.METADATA_DIR, "thumbnails")
        os.makedirs(self.THUMBNAILS_DIR, exist_ok=True)

        self.videos = {}
        self.collections = {}
        self.favorites = []

        self.load_all()

        # Thread control flag
        self._cleanup_thread_running = False

    # Alias to fix "no attribute 'load_metadata'" error if called externally
    def load_metadata(self):
        return self.load_all()

    def load_all(self):
        self.videos = self._load_json(self.videos_path, default={})
        self.collections = self._load_json(self.collections_path, default={})
        self.favorites = self._load_json(self.favorites_path, default=[])

    def save_all(self):
        self._save_json(self.videos_path, self.videos)
        self._save_json(self.collections_path, self.collections)
        self._save_json(self.favorites_path, self.favorites)

    def _load_json(self, path, default):
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except json.JSONDecodeError:
                print(f"Warning: Failed to parse {path}, starting fresh.")
        return default

    def _save_json(self, path, data):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def add_video_metadata(self, video_id, metadata):
        self.videos[video_id] = metadata
        self.save_all()

    def get_video_metadata(self, video_id):
        return self.videos.get(video_id)

    def add_favorite(self, video_id):
        if video_id not in self.favorites and video_id in self.videos:
            self.favorites.append(video_id)
            self.save_all()
            return True
        return False

    def remove_favorite(self, video_id):
        if video_id in self.favorites:
            self.favorites.remove(video_id)
            self.save_all()
            return True
        return False

    def get_favorites(self):
        return self.favorites.copy()

    def add_collection(self, collection_id=None, title="", description=""):
        if collection_id is None:
            if title:
                sanitized_title = self.sanitize_filename(title).lower()
                collection_id = f"{sanitized_title}_{hashlib.md5(title.encode('utf-8')).hexdigest()[:6]}"
            else:
                collection_id = str(uuid.uuid4())

        if collection_id in self.collections:
            return False

        self.collections[collection_id] = {
            "id": collection_id,
            "title": title,
            "description": description,
            "videos": []
        }
        self.save_all()
        return collection_id

    def remove_collection(self, collection_id):
        if collection_id in self.collections:
            del self.collections[collection_id]
            self.save_all()
            return True
        return False

    def get_collection(self, collection_id):
        return self.collections.get(collection_id)

    def add_video_to_collection(self, collection_id, video_id):
        if collection_id not in self.collections or video_id not in self.videos:
            return False
        videos_list = self.collections[collection_id]["videos"]
        if video_id not in videos_list:
            videos_list.append(video_id)
            self.save_all()
            return True
        return False

    def remove_video_from_collection(self, collection_id, video_id):
        if collection_id in self.collections:
            videos_list = self.collections[collection_id]["videos"]
            if video_id in videos_list:
                videos_list.remove(video_id)
                self.save_all()
                return True
        return False

    def get_collections(self):
        return self.collections.copy()

    def get_all_collections(self):
        return list(self.collections.keys())

    @staticmethod
    def get_video_length(cap):
        fps = cap.get(cv2.CAP_PROP_FPS)
        frames = cap.get(cv2.CAP_PROP_FRAME_COUNT)
        return frames / fps if fps > 0 else 0

    @staticmethod
    def sanitize_filename(name):
        normalized = unicodedata.normalize('NFKD', name)
        ascii_name = "".join(c for c in normalized if c.isalnum() or c in (' ', '.', '_', '-')).rstrip()
        return ascii_name or hashlib.md5(name.encode('utf-8')).hexdigest()[:8]

    @staticmethod
    def generate_video_id(key):
        return hashlib.md5(key.encode('utf-8')).hexdigest()

    def generate_thumbnail(self, cap, thumbnail_path):
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        mid_frame = total_frames // 2
        cap.set(cv2.CAP_PROP_POS_FRAMES, mid_frame)
        success, frame = cap.read()
        if success:
            frame = cv2.resize(frame, (160, 90))
            temp_thumb = os.path.join(tempfile.gettempdir(), "thumb_temp.jpg")
            cv2.imwrite(temp_thumb, frame)
            shutil.move(temp_thumb, thumbnail_path)
            return True
        return False

    def generate_metadata_for_file(self, video_path, key, existing_metadata=None):
        print(f"Processing {video_path} ...")
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"Cannot open video {video_path}")
            return None

        length = self.get_video_length(cap)
        base_name = os.path.basename(video_path)
        name_no_ext = os.path.splitext(base_name)[0]
        sanitized_name = self.sanitize_filename(name_no_ext)

        thumbnail_name = f"{sanitized_name}_thumb.jpg"
        thumbnail_path = os.path.join(self.THUMBNAILS_DIR, thumbnail_name)
        success = self.generate_thumbnail(cap, thumbnail_path)
        cap.release()

        if not success:
            print(f"Failed to generate thumbnail for {video_path}")
            return None

        video_id = self.generate_video_id(key)

        metadata = existing_metadata or {}
        metadata.update({
            "id": video_id,
            "address": key,
            "filename": base_name,
            "length_seconds": round(length, 2),
            "thumbnail": os.path.relpath(thumbnail_path, self.VIDEO_DIR).replace("\\", "/"),
            "tags": metadata.get("tags", [])
        })

        return metadata

    def validate_metadata(self):
        existing_addresses = {meta.get("address") for meta in self.videos.values()}

        for root, dirs, files in os.walk(self.VIDEO_DIR):
            if os.path.abspath(root) == os.path.abspath(self.METADATA_DIR):
                continue

            for file in files:
                if file.lower().endswith((".mp4", ".mkv", ".avi")):
                    full_path = os.path.join(root, file)
                    key = os.path.relpath(full_path, self.VIDEO_DIR).replace("\\", "/")
                    if key not in existing_addresses:
                        return True
        return False

    def generate_metadata(self):
        updated = False
        found_files = {}

        for root, dirs, files in os.walk(self.VIDEO_DIR):
            if os.path.abspath(root) == os.path.abspath(self.METADATA_DIR):
                continue

            for file in files:
                if file.lower().endswith((".mp4", ".mkv", ".avi")):
                    full_path = os.path.join(root, file)
                    rel_path = os.path.relpath(full_path, self.VIDEO_DIR).replace("\\", "/")
                    video_id = self.generate_video_id(rel_path)
                    found_files[video_id] = rel_path

                    if video_id not in self.videos:
                        # New video detected
                        metadata = self.generate_metadata_for_file(full_path, rel_path)
                        if metadata:
                            self.videos[video_id] = metadata
                            updated = True
                    else:
                        # Existing metadata present - can update if needed
                        pass

        # Remove metadata entries for files no longer present
        removed_ids = [vid for vid in self.videos if vid not in found_files]
        if removed_ids:
            for vid in removed_ids:
                print(f"Removing metadata for missing file {vid}")
                del self.videos[vid]
            updated = True

        if updated:
            self.save_all()

        return updated