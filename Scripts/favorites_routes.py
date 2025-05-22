from flask import Blueprint, render_template, request, redirect, url_for
from auth import login_required
from flask import jsonify
from shared import metadata_manager

favorites_bp = Blueprint("favorites", __name__)

@favorites_bp.route("/favorites", methods=["GET"])
@login_required
def view_favorites():
    favorite_ids = metadata_manager.get_favorites()
    video_metadata = [metadata_manager.get_video_metadata(vid) for vid in favorite_ids]
    video_metadata = [vid for vid in video_metadata if vid]  # Filter out None
    return render_template("favorites.html", favorites=video_metadata)

@favorites_bp.route("/favorites/add", methods=["POST"])
@login_required
def add_favorite():
    video_id = request.form.get("video_id")
    if video_id:
        metadata_manager.add_favorite(video_id)
    return redirect(request.referrer or url_for("favorites.view_favorites"))

@favorites_bp.route("/favorites/remove", methods=["POST"])
@login_required
def remove_favorite():
    video_id = request.form.get("video_id")
    if video_id:
        metadata_manager.remove_favorite(video_id)
    return redirect(request.referrer or url_for("favorites.view_favorites"))

@favorites_bp.route("/favorites/check", methods=["GET"])
@login_required
def check_favorite():
    video_id = request.args.get("video_id")
    if not video_id:
        return jsonify({"error": "Missing video_id"}), 400

    is_fav = video_id in metadata_manager.get_favorites()
    return jsonify({"video_id": video_id, "is_favorite": is_fav})