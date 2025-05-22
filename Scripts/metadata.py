import os
import cv2
import json
import unicodedata
import hashlib
import shutil

VIDEO_DIR = r"H:/PP/HyperX"  # Your video root folder
METADATA_DIR = os.path.join(VIDEO_DIR, "metadata")
THUMBNAILS_DIR = os.path.join(METADATA_DIR, "thumbnails")

# Create metadata and thumbnails dir if not exist
os.makedirs(THUMBNAILS_DIR, exist_ok=True)

def get_video_length(cap):
    fps = cap.get(cv2.CAP_PROP_FPS)
    frames = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    if fps > 0:
        return frames / fps
    return 0

def generate_thumbnail(cap, thumbnail_path):
    import tempfile
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    mid_frame = total_frames // 2
    cap.set(cv2.CAP_PROP_POS_FRAMES, mid_frame)
    success, frame = cap.read()
    if success:
        frame = cv2.resize(frame, (160, 90))  # Resize thumbnail

        # Save temporarily with a safe ASCII path
        temp_thumb = thumbnail_path.encode('ascii', 'ignore').decode('ascii')
        temp_thumb = os.path.join(tempfile.gettempdir(), "thumb_temp.jpg")
        cv2.imwrite(temp_thumb, frame)

        # Rename to desired Unicode path
        shutil.move(temp_thumb, thumbnail_path)
        return True
    return False

def sanitize_filename(name):
    normalized = unicodedata.normalize('NFKD', name)
    ascii_name = "".join(c for c in normalized if c.isalnum() or c in (' ', '.', '_', '-')).rstrip()
    if not ascii_name:
        ascii_name = hashlib.md5(name.encode('utf-8')).hexdigest()[:8]
    return ascii_name

def generate_video_id(key):
    # You can create a video ID based on a hash of the key (relative path)
    return hashlib.md5(key.encode('utf-8')).hexdigest()

def generate_metadata_for_file(video_path, key):
    print(f"Processing {video_path} ...")
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Cannot open video {video_path}")
        return None

    length = get_video_length(cap)
    base_name = os.path.basename(video_path)
    name_no_ext = os.path.splitext(base_name)[0]

    # Create thumbnail filename and path inside thumbnails folder
    sanitized_name = sanitize_filename(name_no_ext)
    thumbnail_name = f"{sanitized_name}_thumb.jpg"
    thumbnail_path = os.path.join(THUMBNAILS_DIR, thumbnail_name)

    # Generate thumbnail
    success = generate_thumbnail(cap, thumbnail_path)
    cap.release()
    if not success:
        print(f"Failed to generate thumbnail for {video_path}")
        return None

    video_id = generate_video_id(key)

    metadata = {
        "id": video_id,
        "filename": base_name,
        "length_seconds": round(length, 2),
        "thumbnail": os.path.relpath(thumbnail_path, VIDEO_DIR).replace("\\", "/")
    }

    return metadata

def generatemetadata(force_refresh=False):
    metadata_index = {}

    index_path = os.path.join(METADATA_DIR, "metadata_index.json")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            try:
                metadata_index = json.load(f)
            except json.JSONDecodeError:
                print("Warning: Could not parse existing metadata_index.json, starting fresh.")
                metadata_index = {}

    for root, dirs, files in os.walk(VIDEO_DIR):
        # Skip metadata dir to avoid recursive processing
        if os.path.abspath(root) == os.path.abspath(METADATA_DIR):
            continue

        for file in files:
            if file.lower().endswith((".mp4", ".mkv", ".avi")):
                full_path = os.path.join(root, file)
                key = os.path.relpath(full_path, VIDEO_DIR).replace("\\", "/")

                if not force_refresh and key in metadata_index:
                    continue

                metadata = generate_metadata_for_file(full_path, key)
                if metadata:
                    metadata_index[key] = metadata

    # Save metadata index JSON
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(metadata_index, f, indent=2)

    print(f"Metadata generated for {len(metadata_index)} videos.")
    print(f"Index saved at: {index_path}")
