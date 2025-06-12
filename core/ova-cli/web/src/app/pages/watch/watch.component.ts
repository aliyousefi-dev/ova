import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TopNavBarComponent } from '../../components/top-nav-bar/top-nav-bar.component';
import { VideoData } from '../../data-types/video-data';
import { VideoApiService } from '../../services/video-api.service';
import { OvaVideoPlayerComponent } from '../../components/ova-video-player/ova-video-player.component';

@Component({
  selector: 'app-watch',
  standalone: true,
  imports: [CommonModule, TopNavBarComponent, OvaVideoPlayerComponent],
  templateUrl: './watch.component.html',
})
export class WatchComponent implements AfterViewInit {
  loading = true;
  error = false;
  videoId: string | null = null;
  video!: VideoData;

  constructor(
    private route: ActivatedRoute,
    private videoapi: VideoApiService
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
    // Scroll to top when the view initializes
    window.scrollTo(0, 0);
  }

  fetchVideo(videoId: string) {
    this.loading = true;
    this.videoapi.getVideoById(videoId).subscribe({
      next: (response) => {
        this.video = response.data;
        (window as any).video = this.video;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  get videoUrl(): string {
    return this.videoapi.getStreamUrl(this.video.videoId);
  }

  get thumbnailUrl(): string {
    return this.videoapi.getThumbnailUrl(this.video.videoId);
  }

  handleLogout() {
    console.log('Logging out...');
  }

  formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`;
  }
}
