import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TopNavBarComponent } from '../../components/top-nav-bar/top-nav-bar.component';
import { VideoData } from '../../data-types/video-data';
import { APIService } from '../../services/api.service';

@Component({
  selector: 'app-watch',
  standalone: true,
  imports: [CommonModule, TopNavBarComponent],
  templateUrl: './watch.component.html',
})
export class WatchComponent {
  loading = true;
  error = false;
  videoId: string | null = null;
  video: VideoData = {
    videoId: '',
    title: '',
    rating: 0,
    durationSeconds: 0,
    thumbnailPath: '',
    tags: [],
    uploadedAt: '',
    views: 0,
  };

  constructor(private route: ActivatedRoute, private apiService: APIService) {
    this.videoId = this.route.snapshot.paramMap.get('videoId');

    if (this.videoId) {
      this.fetchVideo(this.videoId);
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  fetchVideo(videoId: string) {
    this.loading = true;
    this.apiService.getVideoById(videoId).subscribe({
      next: (response) => {
        this.video = response.data;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  get videoUrl(): string {
    return this.apiService.getStreamUrl(this.video.videoId);
  }

  get thumbnailUrl(): string {
    return this.apiService.getThumbnailUrl(this.video.videoId);
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
