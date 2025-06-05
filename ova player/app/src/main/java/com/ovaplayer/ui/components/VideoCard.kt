package com.ovaplayer.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImagePainter
import coil.compose.rememberAsyncImagePainter
import com.ovaplayer.data.model.VideoData
import android.util.Log

@Composable
fun VideoCard(video: VideoData) {
    Card(
        modifier = Modifier
            .padding(8.dp)
            .fillMaxWidth(),
        shape = RoundedCornerShape(10.dp),
        elevation = CardDefaults.cardElevation(4.dp)
    ) {
        Column {
            val painter = rememberAsyncImagePainter(video.thumbnailPath)
            val painterState = painter.state

            LaunchedEffect(painterState) {
                when (painterState) {
                    is AsyncImagePainter.State.Loading -> {
                        Log.d("VideoCard", "Loading image: ${video.thumbnailPath}")
                    }
                    is AsyncImagePainter.State.Success -> {
                        Log.d("VideoCard", "Image loaded successfully: ${video.thumbnailPath}")
                    }
                    is AsyncImagePainter.State.Error -> {
                        Log.e("VideoCard", "Error loading image: ${video.thumbnailPath}")
                    }
                    else -> {}
                }
            }

            Image(
                painter = painter,
                contentDescription = "Video thumbnail",
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = video.title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 8.dp)
            )
            Text(
                text = "Duration: ${video.durationSeconds}",
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
            )
        }
    }
}
