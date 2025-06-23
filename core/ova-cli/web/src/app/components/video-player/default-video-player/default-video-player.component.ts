import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-default-video-player',
  standalone: true,
  templateUrl: './default-video-player.component.html',
  imports: [CommonModule],
})
export class DefaultVideoPlayerComponent implements AfterViewInit {
  @Input() videoUrl!: string;
  @Input() posterUrl!: string;
  @Input() markers: number[] = []; // e.g. [5, 10, 25]

  @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;

  markerPercents: number[] = [];

  ngAfterViewInit() {
    const videoElement = this.videoRef?.nativeElement;
    if (!videoElement) return;

    const storedMute = localStorage.getItem('isMuted');
    videoElement.muted = storedMute === 'true';
    videoElement.removeEventListener('volumechange', this.onVolumeChange);
    videoElement.addEventListener('volumechange', this.onVolumeChange);

    videoElement.addEventListener('loadedmetadata', () => {
      const duration = videoElement.duration;
      if (duration > 0) {
        this.markerPercents = this.markers
          .filter((t) => t < duration)
          .map((t) => (t / duration) * 100);
      }
    });
  }

  onVolumeChange = () => {
    const videoElement = this.videoRef?.nativeElement;
    if (!videoElement) return;
    localStorage.setItem('isMuted', String(videoElement.muted));
  };
}
