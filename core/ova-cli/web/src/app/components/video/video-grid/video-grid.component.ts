import { Component, Input, OnInit } from '@angular/core';
import { VideoCardComponent } from '../video-card/video-card.component';
import { CommonModule } from '@angular/common';
import { VideoData } from '../../../data-types/video-data';
import { SavedApiService } from '../../../services/api/saved-api.service';
import { WatchedApiService } from '../../../services/api/watched-api.service'; // Import WatchedApiService

@Component({
  selector: 'app-video-grid',
  standalone: true,
  imports: [CommonModule, VideoCardComponent],
  templateUrl: './video-grid.component.html',
})
export class VideoGridComponent implements OnInit {
  @Input() videos: VideoData[] = [];

  SavedIds = new Set<string>();
  WatchedIds = new Set<string>(); // New Set for watched video IDs
  username: string | null = null;

  constructor(
    private savedapi: SavedApiService,
    private watchedapi: WatchedApiService // Inject WatchedApiService
  ) {}

  ngOnInit() {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.username = storedUsername;

      // Fetch saved videos
      this.savedapi.getUserSaved(storedUsername).subscribe({
        next: (favData) => {
          this.SavedIds = new Set(favData.saved);
        },
        error: (err) => {
          console.error('Error fetching saved videos:', err);
          // Handle error, maybe set SavedIds to empty set or show a message
        },
      });

      // Fetch watched videos
      this.watchedapi.getUserWatched(storedUsername).subscribe({
        next: (watchedData) => {
          // Assuming watchedData is an array of VideoData, map to videoIds
          this.WatchedIds = new Set(watchedData.map((video) => video.videoId));
        },
        error: (err) => {
          console.error('Error fetching watched videos:', err);
          // Handle error, maybe set WatchedIds to empty set or show a message
        },
      });
    }
  }

  isSaved(videoId: string): boolean {
    return this.SavedIds.has(videoId);
  }

  // New method to check if a video is watched
  isWatched(videoId: string): boolean {
    return this.WatchedIds.has(videoId);
  }
}
