import {
  Component,
  Input,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // Ensure Router is imported from @angular/router
import { FormsModule } from '@angular/forms';
import { PlaylistModalComponent } from '../../playlist/playlist-modal/playlist-modal.component';
import { PlaylistAPIService } from '../../../services/api/playlist-api.service';
import { VideoApiService } from '../../../services/video-api.service';
import { SavedApiService } from '../../../services/api/saved-api.service';
import { VideoData } from '../../../data-types/video-data';

@Component({
  selector: 'app-video-card',
  templateUrl: './video-card.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PlaylistModalComponent],
})
export class VideoCardComponent implements OnChanges {
  @Input() video!: VideoData;
  @Input() isSaved: boolean = false;
  @Input() username: string = '';
  @Input() isWatched: boolean = false; // Add the new input for 'isWatched'

  hovering = false;
  Saved = false;

  playlistModalVisible = false;
  playlists: { title: string; slug: string; checked: boolean }[] = [];
  originalPlaylists: { title: string; slug: string; checked: boolean }[] = [];

  constructor(
    private playlistapi: PlaylistAPIService,
    private savedapi: SavedApiService,
    private videoapi: VideoApiService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    // You might want to react to changes in `isWatched` here if needed,
    // for example, to update the UI based on the new value.
    if (changes['isWatched']) {
      // console.log('isWatched changed to:', changes['isWatched'].currentValue);
      // Perform any UI updates or logic based on the new isWatched value
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

  addToPlaylist(event: MouseEvent) {
    event.stopPropagation();
    if (!this.username) return;

    this.playlistapi.getUserPlaylists(this.username).subscribe((response) => {
      const pls = response.data.playlists;
      const checkList = pls.map((p) => ({ ...p, checked: false }));

      Promise.all(
        checkList.map(
          (playlist) =>
            new Promise<void>((resolve) => {
              this.playlistapi
                .getUserPlaylistBySlug(this.username, playlist.slug)
                .subscribe((plData) => {
                  playlist.checked = plData.data.videoIds.includes(
                    this.video.videoId
                  );
                  resolve();
                });
            })
        )
      ).then(() => {
        this.playlists = checkList;
        this.originalPlaylists = checkList.map((p) => ({ ...p }));
        this.playlistModalVisible = true;
        this.cd.detectChanges();
      });
    });
  }

  closePlaylistModal(
    updatedPlaylists: { title: string; slug: string; checked: boolean }[]
  ) {
    this.playlistModalVisible = false;
    if (!this.username) return;

    updatedPlaylists.forEach((playlist) => {
      const original = this.originalPlaylists.find(
        (p) => p.slug === playlist.slug
      );
      if (!original) return;

      if (playlist.checked && !original.checked) {
        this.playlistapi
          .addVideoToPlaylist(this.username, playlist.slug, this.video.videoId)
          .subscribe();
      } else if (!playlist.checked && original.checked) {
        this.playlistapi
          .deleteVideoFromPlaylist(
            this.username,
            playlist.slug,
            this.video.videoId
          )
          .subscribe();
      }
    });
  }

  toggleSaved(event: MouseEvent) {
    event.stopPropagation();
    if (!this.username) return;

    this.Saved = true;

    if (this.isSaved) {
      this.savedapi
        .removeUserSaved(this.username, this.video.videoId)
        .subscribe({
          next: () => {
            this.isSaved = false;
            this.Saved = false;
            this.cd.detectChanges();
          },
          error: () => {
            this.Saved = false;
          },
        });
    } else {
      this.savedapi.addUserSaved(this.username, this.video.videoId).subscribe({
        next: () => {
          this.isSaved = true;
          this.Saved = false;
          this.cd.detectChanges();
        },
        error: () => {
          this.Saved = false;
        },
      });
    }
  }

  download(event: MouseEvent) {
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

  navigateToWatch() {
    this.router.navigate(['/watch', this.video.videoId]);
  }
}
