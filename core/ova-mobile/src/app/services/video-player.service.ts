import { Injectable } from '@angular/core';
import { VideoData } from '../data-types/video-data';
import { VideoApiService } from './video-api.service';

@Injectable({ providedIn: 'root' })
export class VideoPlayerService {
  currentVideo: VideoData | null = null;
  videoElement: HTMLVideoElement | null = null;
  isPlaying = false;

  constructor(private videoApi: VideoApiService) {}

  setVideo(video: VideoData) {
    // Ensure thumbnailPath is set, fallback if needed
    if (!video.thumbnailPath || !video.thumbnailPath.trim()) {
      video.thumbnailPath = this.getThumbnailUrl(video.videoId);
    }
    this.currentVideo = video;
    this.isPlaying = true;
    // Optionally, handle play logic here
  }

  getVideo(): VideoData | null {
    return this.currentVideo;
  }

  play() {
    this.isPlaying = true;
    // Optionally, play video element
  }

  pause() {
    this.isPlaying = false;
    // Optionally, pause video element
  }

  clear() {
    this.currentVideo = null;
    this.isPlaying = false;
  }

  getThumbnailUrl(videoId: string): string {
    return this.videoApi.getThumbnailUrl(videoId);
  }
}
