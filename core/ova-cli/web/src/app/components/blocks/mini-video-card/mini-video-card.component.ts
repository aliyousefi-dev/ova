import {
  Component,
  Input,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlaylistModalComponent } from '../../pop-ups/playlist-modal/playlist-modal.component';

import { VideoApiService } from '../../../services/api/video-api.service';
import { SavedApiService } from '../../../services/api/saved-api.service';
import { VideoData } from '../../../data-types/video-data';
import { UtilsService } from '../../../services/utils.service';

@Component({
  selector: 'app-mini-video-card',
  templateUrl: './mini-video-card.component.html',
  standalone: true,
  styles: `.filled-icon {
  fill: #fff !important;
  stroke: none !important; /* or set stroke color if you want */
}`,
  imports: [CommonModule, RouterModule, FormsModule, PlaylistModalComponent],
})
export class MiniVideoCardComponent implements OnChanges, AfterViewInit {
  @Input() video!: VideoData;
  @Input() isSaved: boolean = false;
  @Input() username: string = '';
  @Input() isWatched: boolean = false;
  @Input() PreviewPlayback: boolean = false;

  @ViewChild('preview') videoElement!: ElementRef<HTMLVideoElement>;

  private observer: IntersectionObserver | null = null;

  // Updated ngAfterViewInit
  ngAfterViewInit() {
    if (this.PreviewPlayback && this.videoElement) {
      const video_preview: HTMLVideoElement = this.videoElement.nativeElement;

      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.PlayPreviewVideo();
            } else {
              this.StopPreviewVideo();
            }
          });
        },
        { threshold: 1 }
      );

      this.observer.observe(video_preview);
    }
  }

  // Updated ngOnChanges
  ngOnChanges(changes: SimpleChanges) {
    if (changes['PreviewPlayback']) {
      if (this.PreviewPlayback) {
        this.cd.detectChanges(); // Ensure change detection to make videoElement ready
        setTimeout(() => {
          if (this.videoElement?.nativeElement) {
            this.ngAfterViewInit(); // Re-initialize observer safely
          }
        }, 0);
      } else {
        this.StopPreviewVideo(); // Stop video when PreviewPlayback is false
        if (this.observer) {
          this.observer.disconnect(); // Disconnect observer when no longer needed
        }
      }
    }
  }

  playlistModalVisible = false;

  constructor(
    private savedapi: SavedApiService,
    private videoapi: VideoApiService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private utilsService: UtilsService
  ) {}

  getThumbnailUrl(): string {
    return this.videoapi.getThumbnailUrl(this.video.videoId);
  }

  getPreviewUrl(): string {
    return this.videoapi.getPreviewUrl(this.video.videoId);
  }

  get videoQuality(): string {
    const width = this.video.resolution.width;
    const height = this.video.resolution.height;

    if (width >= 3840 || height >= 2160) return '4K';
    if (width >= 1920 || height >= 1080) return 'HD';
    if (width >= 1280 || height >= 720) return '720p';
    return '';
  }

  addToPlaylist(event: MouseEvent): void {
    event.stopPropagation();
    this.playlistModalVisible = true;
    this.cd.detectChanges();
  }

  StopPreviewVideo() {
    if (this.videoElement?.nativeElement && this.PreviewPlayback) {
      const video: HTMLVideoElement = this.videoElement.nativeElement;
      video.pause();
      video.currentTime = 0;
    }
  }

  PlayPreviewVideo() {
    if (this.videoElement?.nativeElement && this.PreviewPlayback) {
      const video: HTMLVideoElement = this.videoElement.nativeElement;
      video.play();
    }
  }

  closePlaylistModal(): void {
    this.playlistModalVisible = false;
    this.cd.detectChanges();
  }

  toggleSaved(event: MouseEvent): void {
    event.stopPropagation();
    const username = this.utilsService.getUsername();
    if (!username) {
      console.warn('Cannot save/unsave: Username is not available.');
      return;
    }

    if (this.isSaved) {
      this.savedapi.removeUserSaved(username, this.video.videoId).subscribe({
        next: () => {
          this.isSaved = false;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error removing from saved:', err);
        },
      });
    } else {
      this.savedapi.addUserSaved(username, this.video.videoId).subscribe({
        next: () => {
          this.isSaved = true;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error adding to saved:', err);
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

  truncateTitle(title: string, maxLength: number = 20): string {
    return title.length > maxLength
      ? title.substring(0, maxLength) + '...'
      : title;
  }
}
