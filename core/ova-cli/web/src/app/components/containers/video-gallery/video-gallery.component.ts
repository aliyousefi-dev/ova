import { Component, Input, OnInit } from '@angular/core';
import { VideoCardComponent } from '../../blocks/video-card/video-card.component';
import { MiniVideoCardComponent } from '../../blocks/mini-video-card/mini-video-card.component';
import { CommonModule } from '@angular/common';
import { VideoData } from '../../../data-types/video-data';
import { SavedApiService } from '../../../services/api/saved-api.service';
import { WatchedApiService } from '../../../services/api/watched-api.service'; // Import WatchedApiService
import { UserSettingsService } from '../../../services/user-settings.service';

@Component({
  selector: 'app-video-gallery',
  standalone: true,
  imports: [CommonModule, VideoCardComponent, MiniVideoCardComponent],
  templateUrl: './video-gallery.component.html',
})
export class VideoGalleryComponent implements OnInit {
  @Input() videos: VideoData[] = [];

  isMini: boolean = true;
  // Toggle gallery mode (mini/full) and persist using UserSettingsService
  toggleGalleryMode(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.isMini = !checked;
    this.userSettingsService.setGalleryViewMode(this.isMini ? 'true' : 'false');
  }

  SavedIds = new Set<string>();
  WatchedIds = new Set<string>(); // New Set for watched video IDs
  username: string | null = null;

  constructor(
    private savedapi: SavedApiService,
    private watchedapi: WatchedApiService, // Inject WatchedApiService
    private userSettingsService: UserSettingsService
  ) {}

  ngOnInit() {
    // Load gallery mode from UserSettingsService
    const storedIsMini = this.userSettingsService.getGalleryViewMode();
    if (storedIsMini !== null) {
      this.isMini = storedIsMini === 'true';
    }

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
