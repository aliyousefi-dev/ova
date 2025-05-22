from flask import Blueprint, render_template, request
from auth import login_required
from shared import metadata_manager 
from flask import url_for
from flask import jsonify

explore_bp = Blueprint("explore", __name__)

@explore_bp.route("/explore", methods=["GET"])
@login_required
def explore_page():
    query = request.args.get("q", "").strip().lower()

    all_videos = list(metadata_manager.videos.values())

    if query:
        filtered = [
            video for video in all_videos
            if query in video.get("title", "").lower()
            or query in video.get("filename", "").lower()
            or any(query in tag.lower() for tag in video.get("tags", []))
        ]
    else:
        filtered = all_videos

    # Prepare videos for template with correct URL paths
    videos_for_template = []
    for video in filtered:
        video_id = video.get("id")
        thumbnail_url = url_for("video.serve_thumbnail", video_id=video_id) if video_id else None
        watch_url = url_for("video.watch_video", video_id=video_id) if video_id else "#"
        videos_for_template.append({
            "id": video_id,  # use "id" instead of "video_id" to be consistent if your template uses video.id
            "title": video.get("filename", "Untitled"),
            "tags": video.get("tags", []),
            "thumbnail": thumbnail_url,
            "length_seconds": video.get("length_seconds", 0),
            "watch_url": watch_url,
        })


    return render_template("explore.html", videos=videos_for_template, query=query)

@explore_bp.route("/api/explore", methods=["GET"])
@login_required
def explore_api():
    query = request.args.get("q", "").strip().lower()

    all_videos = list(metadata_manager.videos.values())

    if query:
        filtered = [
            video for video in all_videos
            if query in video.get("title", "").lower()
            or query in video.get("filename", "").lower()
            or any(query in tag.lower() for tag in video.get("tags", []))
        ]
    else:
        filtered = all_videos

    videos_for_template = []
    for video in filtered:
        video_id = video.get("id")
        videos_for_template.append({
            "id": video_id,
            "title": video.get("filename", "Untitled"),
            "tags": video.get("tags", []),
            "thumbnail": url_for("video.serve_thumbnail", video_id=video_id) if video_id else None,
            "length_seconds": video.get("length_seconds", 0),
            "watch_url": url_for("video.watch_video", video_id=video_id) if video_id else "#",
        })

    return jsonify(videos_for_template)