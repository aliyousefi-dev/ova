from flask import Blueprint, render_template, request, redirect, url_for, jsonify
from auth import login_required
from shared import metadata_manager  # shared singleton

collections_bp = Blueprint("collections", __name__)

@collections_bp.route("/collections", methods=["GET", "POST"])
@login_required
def collections_page():
    if request.method == "POST":
        if "delete_all" in request.form:
            metadata_manager.collections.clear()
            metadata_manager.save_all()

        elif "delete" in request.form:
            to_delete = request.form.get("delete")
            if to_delete:
                metadata_manager.remove_collection(to_delete)

        elif "name" in request.form:
            name = request.form.get("name", "").strip()
            if name:
                metadata_manager.add_collection(title=name)

        elif "add_video_collection" in request.form:
            col_id = request.form.get("add_video_collection")
            video_id = request.form.get("video_id")
            if col_id and video_id:
                metadata_manager.add_video_to_collection(col_id, video_id)

        return redirect(url_for("collections.collections_page"))

    collections = metadata_manager.get_collections()
    return render_template("collections.html", collections=collections)

@collections_bp.route("/collection/<collection_id>", methods=["GET", "POST"])
@login_required
def view_collection(collection_id):
    collections = metadata_manager.get_collections()
    if collection_id not in collections:
        return "Collection not found", 404

    if request.method == "POST":
        video_id = request.form.get("remove_video")
        if video_id:
            metadata_manager.remove_video_from_collection(collection_id, video_id)
        return redirect(url_for("collections.view_collection", collection_id=collection_id))

    video_ids = collections[collection_id]["videos"]
    videos = [
        metadata_manager.get_video_metadata(vid)
        for vid in video_ids
        if metadata_manager.get_video_metadata(vid)
    ]
    return render_template(
        "collection_view.html",
        name=collections[collection_id]["title"],
        videos=videos
    )

# ✅ API: Fetch all collection names
@collections_bp.route("/api/collections", methods=["GET"])
@login_required
def get_collections_api():
    collection_titles = [
        {"id": k, "title": v["title"]}
        for k, v in metadata_manager.get_collections().items()
    ]
    return jsonify(collection_titles)

# ✅ API: Add video to a collection
@collections_bp.route("/api/add_to_collection", methods=["POST"])
@login_required
def add_to_collection_api():
    data = request.get_json()
    video_id = data.get("video_id")
    collection_id = data.get("collection_id")

    if not video_id or not collection_id:
        return jsonify({"status": "error", "message": "Missing data"}), 400

    success = metadata_manager.add_video_to_collection(collection_id, video_id)
    return jsonify({"status": "success" if success else "error"})

@collections_bp.route("/api/collections_for_video/<video_id>")
@login_required
def collections_for_video(video_id):
    collections = metadata_manager.get_collections()
    # Filter collections that contain the video_id
    video_collections = [
        {"id": col_id, "title": col_data["title"]}
        for col_id, col_data in collections.items()
        if video_id in col_data.get("videos", [])
    ]
    return jsonify(video_collections)

@collections_bp.route("/api/remove_video_from_collection/<collection_id>", methods=["POST"])
@login_required
def api_remove_video_from_collection(collection_id):
    data = request.get_json()
    video_id = data.get("video_id")
    if not video_id:
        return jsonify({"error": "Missing video_id"}), 400
    try:
        metadata_manager.remove_video_from_collection(collection_id, video_id)
        metadata_manager.save_all()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
