import os
from flask import Blueprint, render_template, send_from_directory, send_file, request, url_for
from config import VIDEO_DIR
from auth import login_required

video_bp = Blueprint("video", __name__)

# Shared instance of MetadataManager must be set externally (e.g. in app.py)
from shared import metadata_manager

@video_bp.route("/videos", defaults={"subpath": ""})
@video_bp.route("/videos/<path:subpath>")
@login_required
def video_list(subpath):
    current_path = os.path.join(VIDEO_DIR, subpath)
    if not os.path.isdir(current_path):
        return "Folder not found", 404

    folders = []
    video_files = []

    # Gather folder list and video metadata
    for item in os.listdir(current_path):
        full_path = os.path.join(current_path, item)
        rel_path = os.path.relpath(full_path, VIDEO_DIR).replace("\\", "/")
        if os.path.isdir(full_path) and item.lower() != "metadata":
            folders.append(rel_path)
        elif item.lower().endswith((".mp4", ".mkv", ".avi")):
            # Find the metadata by matching video path address
            # Since videos are indexed by id, find video with matching address
            video_meta = None
            for vid_meta in metadata_manager.videos.values():
                if vid_meta.get("address") == rel_path:
                    video_meta = vid_meta
                    break
            if not video_meta:
                # fallback metadata
                video_meta = {
                    "id": None,
                    "filename": item,
                    "length_seconds": 0,
                    "tags": [],
                    "thumbnail": None
                }
            video_files.append({
                "id": video_meta.get("id"),
                "path": rel_path,
                "filename": video_meta.get("filename", item),
                "length_seconds": video_meta.get("length_seconds", 0),
                "tags": video_meta.get("tags", []),
                "thumbnail_url": url_for("video.serve_thumbnail", video_id=video_meta.get("id")) if video_meta.get("id") else None,
                "watch_url": url_for("video.watch_video", video_id=video_meta.get("id")) if video_meta.get("id") else None,
            })

    return render_template("videos.html", folders=folders, videos=video_files, current=subpath)

@video_bp.route("/thumbnail/<video_id>")
@login_required
def serve_thumbnail(video_id):
    video_meta = metadata_manager.get_video_metadata(video_id)
    if not video_meta:
        return "Thumbnail not found", 404

    thumbnail_rel = video_meta.get("thumbnail")
    if not thumbnail_rel:
        return "Thumbnail not found", 404

    thumb_dir = os.path.join(VIDEO_DIR, os.path.dirname(thumbnail_rel))
    filename = os.path.basename(thumbnail_rel)
    return send_from_directory(thumb_dir, filename)

@video_bp.route("/watch/<video_id>")
@login_required
def watch_video(video_id):
    video_meta = metadata_manager.get_video_metadata(video_id)
    if not video_meta:
        return "Video not found", 404

    filename = video_meta.get("address")
    if not filename:
        return "Video path not found", 404

    cliptitle = video_meta.get("filename", "None")
    tags = video_meta.get("tags", [])
    collections_for_video = video_meta.get("collections", [])

    full_path = os.path.join(VIDEO_DIR, filename)
    if not os.path.isfile(full_path):
        return "Video file not found", 404

    return render_template(
        "watch.html",
        filename=filename,
        cliptitle=cliptitle,
        tags=tags,
        collections=collections_for_video,
        video_id=video_id,
        metadata=video_meta,
    )

@video_bp.route("/stream/<video_id>")
@login_required
def stream_video(video_id):
    video_meta = metadata_manager.get_video_metadata(video_id)
    if not video_meta:
        return "Video not found", 404

    filename = video_meta.get("address")
    full_path = os.path.join(VIDEO_DIR, filename)
    if os.path.exists(full_path):
        return send_file(full_path)
    return "File not found", 404
