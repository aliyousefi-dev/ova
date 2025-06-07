package com.ovaplayer

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import com.ovaplayer.data.model.VideoData
import com.ovaplayer.ui.components.VideoCard
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {

    // Sample video list
    private val sampleVideos = List(20) { index ->
        VideoData(
            videoId = (index + 1).toString(),
            title = "Sample Video ${index + 1}",
            filePath = "https://placehold.co/600x400",
            rating = 3.0 + (index % 3),
            durationSeconds = 180 + (index * 10),
            thumbnailPath = "http://192.168.52.106:4040/api/v1/thumbnail/905806190b7569192c42f58dfd280cbb1266963585ecf6451f6013760181f290",
            previewPath = null,
            tags = listOf("tag${index % 5}", "tag${(index + 1) % 5}"),
            views = 100 * index,
            width = 1280,
            height = 720,
            uploadedAt = "2025-06-05T00:00:00Z"
        )
    }

    // Bottom navigation items data class
    data class NavItem(val label: String, val icon: ImageVector)

    private val navItems = listOf(
        NavItem("Discover", Icons.Filled.Search),
        NavItem("Library", Icons.Filled.PlayArrow),
        NavItem("Home", Icons.Filled.Home)
    )

    @OptIn(ExperimentalMaterial3Api::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                var selectedItem by remember { mutableStateOf(2) } // Default to "Home"

                Scaffold(
                    topBar = {
                        TopAppBar(
                            title = { Text(text = navItems[selectedItem].label) }
                        )
                    },
                    bottomBar = {
                        NavigationBar {
                            navItems.forEachIndexed { index, item ->
                                NavigationBarItem(
                                    icon = { Icon(item.icon, contentDescription = item.label) },
                                    label = { Text(item.label) },
                                    selected = selectedItem == index,
                                    onClick = { selectedItem = index }
                                )
                            }
                        }
                    }
                ) { innerPadding ->
                    // Content depending on selected tab
                    when (selectedItem) {
                        0 -> DiscoverScreen(Modifier.padding(innerPadding))
                        1 -> LibraryScreen(Modifier.padding(innerPadding))
                        2 -> HomeScreen(sampleVideos, Modifier.padding(innerPadding))
                    }
                }
            }
        }
    }
}

@Composable
fun DiscoverScreen(modifier: Modifier = Modifier) {
    Surface(modifier = modifier.fillMaxSize()) {
        Text(
            text = "Discover Screen",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(16.dp)
        )
    }
}

@Composable
fun LibraryScreen(modifier: Modifier = Modifier) {
    Surface(modifier = modifier.fillMaxSize()) {
        Text(
            text = "Library Screen",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(16.dp)
        )
    }
}


@Composable
fun HomeScreen(videos: List<VideoData>, modifier: Modifier = Modifier) {
    LazyColumn(modifier = modifier) {
        items(videos) { video ->
            VideoCard(video)
        }
    }
}


@Composable
fun PreviewHomeScreen() {
    val sampleVideos = List(5) { index ->
        VideoData(
            videoId = (index + 1).toString(),
            title = "Preview Video ${index + 1}",
            filePath = "",
            rating = 4.0,
            durationSeconds = 200,
            thumbnailPath = "https://placehold.co/600x400",
            previewPath = null,
            tags = listOf("sample", "demo"),
            views = 1000,
            width = 1280,
            height = 720,
            uploadedAt = "2025-06-05T00:00:00Z"
        )
    }

    HomeScreen(videos = sampleVideos)
}

@Preview(showBackground = true)
@Composable
fun PreviewMainActivity() {
    val sampleVideos = List(5) { index ->
        VideoData(
            videoId = (index + 1).toString(),
            title = "Preview Video ${index + 1}",
            filePath = "",
            rating = 4.0,
            durationSeconds = 200,
            thumbnailPath = "https://placehold.co/600x400",
            previewPath = null,
            tags = listOf("sample", "demo"),
            views = 1000,
            width = 1280,
            height = 720,
            uploadedAt = "2025-06-05T00:00:00Z"
        )
    }

    MaterialTheme {
        var selectedItem by remember { mutableStateOf(2) } // Default to "Home"

        Scaffold(
            topBar = {
            },
            bottomBar = {
                NavigationBar {
                    listOf(
                        MainActivity.NavItem("Discover", Icons.Filled.Search),
                        MainActivity.NavItem("Library", Icons.Filled.PlayArrow),
                        MainActivity.NavItem("Home", Icons.Filled.Home)
                    ).forEachIndexed { index, item ->
                        NavigationBarItem(
                            icon = { Icon(item.icon, contentDescription = item.label) },
                            label = { Text(item.label) },
                            selected = selectedItem == index,
                            onClick = { selectedItem = index }
                        )
                    }
                }
            }
        ) { innerPadding ->
            // Content depending on selected tab
            when (selectedItem) {
                0 -> DiscoverScreen(Modifier.padding(innerPadding))
                1 -> LibraryScreen(Modifier.padding(innerPadding))
                2 -> HomeScreen(sampleVideos, Modifier.padding(innerPadding))
            }
        }
    }
}
