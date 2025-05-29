from flask import Blueprint, jsonify, request
from auth import login_required
from shared import metadata_manager  # shared.py provides metadata_manager instance

# Create a Blueprint for tags feature
tags_bp = Blueprint('tags', __name__)

@tags_bp.route("/tags/<video_id>", methods=["GET"])
@login_required
def get_tags(video_id):
    metadata = metadata_manager.get_video_metadata(video_id)

    if metadata is None:
        return jsonify({"error": "Video not found"}), 404

    return jsonify(metadata.get("tags", []))


@tags_bp.route("/tags/<video_id>", methods=["POST"])
@login_required
def add_tag(video_id):
    metadata = metadata_manager.get_video_metadata(video_id)

    if metadata is None:
        return jsonify({"error": "Video not found"}), 404

    data = request.get_json()
    new_tag = data.get("tag", "").strip()

    if not new_tag:
        return jsonify({"error": "Tag cannot be empty"}), 400

    # Add tags list if not present
    tags = metadata.setdefault("tags", [])

    if new_tag not in tags:
        tags.append(new_tag)
        metadata_manager.save_all()

    return jsonify(tags)

@tags_bp.route("/tags/<video_id>", methods=["DELETE"])
@login_required
def delete_tag(video_id):
    metadata = metadata_manager.get_video_metadata(video_id)

    if metadata is None:
        return jsonify({"error": "Video not found"}), 404

    data = request.get_json()
    tag_to_delete = data.get("tag", "").strip()

    if not tag_to_delete:
        return jsonify({"error": "Tag to delete must be provided"}), 400

    tags = metadata.get("tags", [])

    if tag_to_delete in tags:
        tags.remove(tag_to_delete)
        metadata_manager.save_all()
        return jsonify({"message": f"Tag '{tag_to_delete}' removed.", "tags": tags})

    return jsonify({"error": "Tag not found"}), 404
