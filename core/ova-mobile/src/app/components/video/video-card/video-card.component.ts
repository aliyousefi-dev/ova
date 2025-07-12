import {
  Component,
  Input,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlaylistModalComponent } from '../../playlist/playlist-modal/playlist-modal.component';
// Removed PlaylistAPIService as it's no longer directly used for playlist management here
import { VideoApiService } from '../../../services/api/video-api.service';
import { SavedApiService } from '../../../services/api/saved-api.service';
import { VideoData } from '../../../services/api/api-types';
import { TagLinkComponent } from '../tag-link/tag-link.component';
import { UtilsService } from '../../../services/utils.service';

@Component({
  selector: 'app-video-card',
  templateUrl: './video-card.component.html',
  standalone: true,
  styles: `.filled-icon {
  fill: #fff !important;
  stroke: none !important; /* or set stroke color if you want */
}`,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PlaylistModalComponent,
    TagLinkComponent,
  ],
})
export class VideoCardComponent implements OnChanges {
  @Input() video!: VideoData;
  @Input() isSaved: boolean = false;
  @Input() username: string = ''; // Keep username input for other components that might use it
  @Input() isWatched: boolean = false;

  hovering = false;
  // 'Saved' property is no longer needed as 'isSaved' directly reflects the state
  // Saved = false;

  playlistModalVisible = false;
  // Removed 'playlists' and 'originalPlaylists' as they are now managed inside PlaylistModalComponent

  constructor(
    // Removed private playlistapi: PlaylistAPIService,
    private savedapi: SavedApiService,
    private videoapi: VideoApiService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private utilsService: UtilsService // Inject UtilsService to get username for other API calls
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isWatched']) {
      // console.log('isWatched changed to:', changes['isWatched'].currentValue);
    }
    this.cd.detectChanges(); // Ensure bindings update when video input changes
  }

  getThumbnailUrl(): string {
    return this.videoapi.getThumbnailUrl(this.video.videoId);
  }

  getPreviewUrl(): string {
    return this.videoapi.getPreviewUrl(this.video.videoId);
  }

  get videoQuality(): string {
    if (!this.video) return '';
    const width = this.video.resolution.width;
    const height = this.video.resolution.height;

    if (width >= 3840 || height >= 2160) return '4K';
    if (width >= 1920 || height >= 1080) return 'HD';
    if (width >= 1280 || height >= 720) return '720p';
    return '';
  }

  addToPlaylist(event: MouseEvent): void {
    event.stopPropagation();
    // No need to check this.username here, the modal will fetch it
    this.playlistModalVisible = true;
    this.cd.detectChanges();
  }

  closePlaylistModal(): void {
    this.playlistModalVisible = false;
    this.cd.detectChanges();
  }

  toggleSaved(event: MouseEvent): void {
    event.stopPropagation();
    const username = this.utilsService.getUsername(); // Get username from UtilsService
    if (!username) {
      console.warn('Cannot save/unsave: Username is not available.');
      return;
    }

    // this.Saved = true; // No longer needed

    if (this.isSaved) {
      this.savedapi.removeUserSaved(username, this.video.videoId).subscribe({
        next: () => {
          this.isSaved = false;
          // this.Saved = false;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error removing from saved:', err);
          // this.Saved = false;
        },
      });
    } else {
      this.savedapi.addUserSaved(username, this.video.videoId).subscribe({
        next: () => {
          this.isSaved = true;
          // this.Saved = false;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error adding to saved:', err);
          // this.Saved = false;
        },
      });
    }
  }

  download(event: MouseEvent): void {
    event.stopPropagation();
    const streamUrl = this.videoapi.getDownloadUrl(this.video.videoId);
    const anchor = document.createElement('a');
    anchor.href = streamUrl;
    anchor.download = `${this.video.title}.mp4`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    return parts.join(' ');
  }

  get timeSinceAdded(): string {
    if (!this.video.uploadedAt) return 'unknown';

    const addedDate = new Date(this.video.uploadedAt);
    const now = new Date();
    const diffMs = now.getTime() - addedDate.getTime();
    if (diffMs < 0) return 'just now';

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  }

  navigateToWatch(): void {
    this.router.navigate(['/watch', this.video.videoId]);
  }
}
