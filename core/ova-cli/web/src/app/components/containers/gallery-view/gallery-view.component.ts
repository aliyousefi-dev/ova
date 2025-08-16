import { Component, Input, OnInit } from '@angular/core';
import { VideoCardComponent } from '../../blocks/video-card/video-card.component';
import { MiniVideoCardComponent } from '../../blocks/mini-video-card/mini-video-card.component';
import { CommonModule } from '@angular/common';
import { VideoData } from '../../../data-types/video-data';
import { SavedApiService } from '../../../services/api/saved-api.service';
import { WatchedApiService } from '../../../services/api/watched-api.service';

@Component({
  selector: 'app-gallery-view',
  standalone: true,
  imports: [CommonModule, VideoCardComponent, MiniVideoCardComponent],
  templateUrl: './gallery-view.component.html',
})
export class GalleryViewComponent implements OnInit {
  @Input() videos: VideoData[] = [];
  @Input() ViewMode: string = 'mini';
  @Input() PreviewPlayback: boolean = false;

  SavedIds = new Set<string>();
  WatchedIds = new Set<string>();
  username: string | null = null;

  constructor(
    private savedapi: SavedApiService,
    private watchedapi: WatchedApiService
  ) {}

  ngOnInit() {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.username = storedUsername;

      // Fetch saved videos
      this.savedapi.getUserSaved(storedUsername).subscribe({
        next: (favData) => {
          this.SavedIds = new Set(favData.data.videoIds);
        },
        error: (err) => {
          console.error('Error fetching saved videos:', err);
        },
      });

      // Fetch watched videos
      this.watchedapi.getUserWatched(storedUsername).subscribe({
        next: (watchedData) => {
          this.WatchedIds = new Set(watchedData.data.videoIds);
        },
        error: (err) => {
          console.error('Error fetching watched videos:', err);
        },
      });
    }
  }

  isSaved(videoId: string): boolean {
    return this.SavedIds.has(videoId);
  }

  isWatched(videoId: string): boolean {
    return this.WatchedIds.has(videoId);
  }
}
