import {
  Component,
  Input,
  CUSTOM_ELEMENTS_SCHEMA,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import 'vidstack/player';
import 'vidstack/player/layouts/default';
import 'vidstack/player/ui';
import { VideoData } from '../../../data-types/video-data';
import { VideoApiService } from '../../../services/ova-backend/video-api.service';
import { MarkerApiService } from '../../../services/ova-backend/marker-api.service';

@Component({
  selector: 'app-vidstack-player',
  standalone: true,
  templateUrl: './vidstack-player.component.html',
  styleUrls: ['./vidstack-player.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
})
export class VidstackPlayerComponent implements AfterViewInit {
  @Input() videoData!: VideoData;

  @ViewChild('mediaPlayer', { static: false }) mediaPlayerRef!: ElementRef;

  isFullscreenOverlay = false;

  constructor(
    public videoapi: VideoApiService,
    private markerapi: MarkerApiService
  ) {}

  ngAfterViewInit(): void {
    const updateOverlay = () => {
      const isFullscreen = !!document.fullscreenElement;
      this.isFullscreenOverlay = isFullscreen;
    };
    document.addEventListener('fullscreenchange', updateOverlay);
    window.addEventListener('orientationchange', updateOverlay);
  }

  // Get current playback time of the media player
  getCurrentTime(): number {
    const mediaPlayer: any = this.mediaPlayerRef?.nativeElement;
    return mediaPlayer?.currentTime || 0;
  }

  get videoUrl(): string {
    return this.videoapi.getStreamUrl(this.videoData.videoId);
  }

  get thumbnailUrl(): string {
    return this.videoapi.getThumbnailUrl(this.videoData.videoId);
  }

  get previewThumbsUrl(): string {
    return this.videoapi.getPreviewThumbsUrl(this.videoData.videoId);
  }

  get markerFileUrl(): string {
    return this.markerapi.getMarkerFileUrl(this.videoData.videoId);
  }
}
