from flask import Blueprint, request, jsonify, current_app
from auth import login_required
from shared import metadata_manager  # assuming shared.py provides metadata_manager

rating_bp = Blueprint("rating", __name__)

@rating_bp.route("/rating", methods=["POST"])
@login_required
def rate_video():
    data = request.get_json()  # parse JSON body

    video_id = data.get("video_id") if data else None
    rating = data.get("rating") if data else None

    if not video_id or not rating:
        return jsonify({"success": False, "error": "Missing video_id or rating"}), 400

    try:
        rating = int(rating)
        if rating < 1 or rating > 5:
            raise ValueError()
    except ValueError:
        return jsonify({"success": False, "error": "Invalid rating value"}), 400

    metadata = metadata_manager.get_video_metadata(video_id)
    if not metadata:
        return jsonify({"success": False, "error": "Video ID not found"}), 404

    # Update rating
    metadata["rating"] = rating
    metadata_manager.videos[video_id] = metadata
    metadata_manager.save_all()

    return jsonify({
        "success": True,
        "video_id": video_id,
        "new_rating": rating
    })


@rating_bp.route("/rating/<video_id>", methods=["GET"])
@login_required
def get_video_rating(video_id):
    metadata = metadata_manager.get_video_metadata(video_id)
    if not metadata:
        return jsonify({"success": False, "error": "Video ID not found"}), 404

    rating = metadata.get("rating", None)  # Default to None if no rating yet

    return jsonify({
        "success": True,
        "video_id": video_id,
        "rating": rating
    })
