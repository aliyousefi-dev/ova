import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TopNavBarComponent } from '../../components/top-nav-bar/top-nav-bar.component';
import { VideoData } from '../../data-types/video-data';
import { VideoApiService } from '../../services/video-api.service';
import { TagChipComponent } from '../../components/tag-chip/tag-chip.component';
import { FavoriteApiService } from '../../services/api/favorite-api.service';

@Component({
  selector: 'app-watch',
  standalone: true,
  imports: [CommonModule, FormsModule, TopNavBarComponent, TagChipComponent],
  templateUrl: './watch.page.html',
  styleUrls: ['./watch.page.css'],
})
export class WatchPage implements AfterViewInit {
  @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;

  loading = true;
  error = false;
  videoId: string | null = null;
  video!: VideoData;

  newTag: string = '';
  updatingTags = false;
  tagUpdateError = false;

  isFavorite = false;
  favoriteLoading = false;
  username = ''; // filled from auth

  playedPercent = 0;
  bufferedPercent = 0;

  similarVideos: VideoData[] = [];
  similarVideosLoading = false;
  similarVideosError = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private favoriteApi: FavoriteApiService,
    public videoapi: VideoApiService
  ) {
    this.videoId = this.route.snapshot.paramMap.get('videoId');

    if (this.videoId) {
      this.fetchVideo(this.videoId);
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  ngAfterViewInit(): void {
    window.scrollTo(0, 0);
    // muted attribute is set in template, no need to set here
  }

  onVideoLoaded() {
    const videoElement = this.videoRef?.nativeElement;
    if (videoElement) {
      // Set muted state from localStorage
      const storedMute = localStorage.getItem('isMuted');
      videoElement.muted = storedMute === 'true';

      // Remove previous listeners if any to avoid duplicates
      videoElement.removeEventListener('volumechange', this.onVolumeChange);

      // Attach listener
      videoElement.addEventListener('volumechange', this.onVolumeChange);
    }
  }

  // Separate handler method to enable add/remove listener easily
  onVolumeChange = () => {
    const videoElement = this.videoRef?.nativeElement;
    if (!videoElement) return;

    localStorage.setItem('isMuted', String(videoElement.muted));
    console.log('changed'); // Should now reliably fire on mute/unmute
  };

  fetchVideo(videoId: string) {
    this.loading = true;
    this.error = false;
    this.videoapi.getVideoById(videoId).subscribe({
      next: (response) => {
        this.video = response.data;
        (window as any).video = this.video;
        this.loading = false;

        // After loading video, load similar videos
        this.loadSimilarVideos(videoId);
        this.username = localStorage.getItem('username') ?? '';

        this.checkIfFavorite();
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  loadSimilarVideos(videoId: string) {
    this.similarVideosLoading = true;
    this.similarVideosError = false;

    this.videoapi.getSimilarVideos(videoId).subscribe({
      next: (res) => {
        this.similarVideos = res.data.similarVideos || [];
        this.similarVideosLoading = false;
      },
      error: () => {
        this.similarVideosLoading = false;
        this.similarVideosError = true;
      },
    });
  }

  navigateToVideo(videoId: string) {
    if (videoId === this.videoId) return;

    this.loading = true;
    this.error = false;
    this.similarVideos = [];
    this.similarVideosLoading = true;
    this.similarVideosError = false;

    this.router.navigate(['/watch', videoId], { replaceUrl: true }).then(() => {
      this.videoId = videoId;
      this.fetchVideo(videoId);
      window.scrollTo(0, 0);
    });
  }

  get videoUrl(): string {
    return this.videoapi.getStreamUrl(this.video.videoId);
  }

  get thumbnailUrl(): string {
    return this.videoapi.getThumbnailUrl(this.video.videoId);
  }

  formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`;
  }

  addTag() {
    const tag = this.newTag.trim();
    if (!tag) return;

    if (this.video.tags.includes(tag)) {
      this.newTag = '';
      return;
    }

    if (!this.videoId) return;

    this.updatingTags = true;
    this.tagUpdateError = false;

    this.videoapi.addVideoTag(this.videoId, tag).subscribe({
      next: (res) => {
        this.video.tags = res.data.tags;
        this.newTag = '';
        this.updatingTags = false;
      },
      error: () => {
        this.updatingTags = false;
        this.tagUpdateError = true;
      },
    });
  }

  onTagRemoved(removedTag: string) {
    const index = this.video.tags.indexOf(removedTag);
    if (index !== -1) {
      this.video.tags.splice(index, 1);
    }
  }

  checkIfFavorite() {
    if (!this.username || !this.videoId) return;

    this.favoriteApi.getUserFavorites(this.username).subscribe({
      next: (res) => {
        this.isFavorite = res.favorites.includes(this.videoId!);
      },
      error: () => {
        this.isFavorite = false;
      },
    });
  }

  toggleFavorite() {
    if (!this.username || !this.videoId) return;

    this.favoriteLoading = true;

    const done = () => (this.favoriteLoading = false);

    if (this.isFavorite) {
      this.favoriteApi
        .removeUserFavorite(this.username, this.videoId)
        .subscribe({
          next: () => {
            this.isFavorite = false;
            done();
          },
          error: () => done(),
        });
    } else {
      this.favoriteApi.addUserFavorite(this.username, this.videoId).subscribe({
        next: () => {
          this.isFavorite = true;
          done();
        },
        error: () => done(),
      });
    }
  }
}
