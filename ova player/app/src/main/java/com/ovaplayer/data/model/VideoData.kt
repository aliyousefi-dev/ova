package com.ovaplayer.data.model

data class VideoData(
    val videoId: String,
    val title: String,
    val filePath: String,
    val rating: Double,
    val durationSeconds: Int,
    val thumbnailPath: String?,  // nullable
    val previewPath: String?,    // nullable
    val tags: List<String>,
    val views: Int,
    val width: Int,
    val height: Int,
    val uploadedAt: String       // ISO 8601 timestamp as a string
)
