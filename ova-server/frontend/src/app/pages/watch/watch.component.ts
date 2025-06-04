import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TopNavBarComponent } from '../../components/top-nav-bar/top-nav-bar.component';
import { VideoData } from '../../data-types/video-data';
import { VideoApiService } from '../../services/video-api.service';

import Plyr from 'plyr';

@Component({
  selector: 'app-watch',
  standalone: true,
  imports: [CommonModule, TopNavBarComponent],
  templateUrl: './watch.component.html',
})
export class WatchComponent implements AfterViewInit, OnDestroy {
  loading = true;
  error = false;
  videoId: string | null = null;
  video!: VideoData;

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  private player?: Plyr;

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

  fetchVideo(videoId: string) {
    this.loading = true;
    this.videoapi.getVideoById(videoId).subscribe({
      next: (response) => {
        this.video = response.data;
        this.loading = false;
        // Plyr needs to be initialized after video loads
        setTimeout(() => {
          this.initPlyr();
        }, 0);
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  ngAfterViewInit() {
    if (this.video) {
      this.initPlyr();
    }
  }

  ngOnDestroy() {
    this.player?.destroy();
  }

  initPlyr() {
    if (this.player) {
      this.player.destroy();
    }
    if (this.videoPlayer) {
      this.player = new Plyr(this.videoPlayer.nativeElement, {
        controls: [
          'play',
          'progress',
          'current-time',
          'mute',
          'volume',
          'fullscreen',
        ],
      });
    }
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
}
