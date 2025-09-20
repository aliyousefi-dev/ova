import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VideoApiService } from '../../../services/ova-backend/video-api.service';
import { SendtoModalComponent } from '../../../components/pop-ups/sendto-modal/sendto-modal.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-video-action-bar',
  standalone: true,
  imports: [CommonModule, SendtoModalComponent, RouterModule], // Add PlaylistModalComponent to imports
  templateUrl: './video-action-bar.component.html',
  styles: [],
})
export class VideoActionBarComponent {
  @Input() videoId?: string | null;
  @Input() getCurrentTimeFn?: () => number;

  @Input() videoDurationSeconds?: number;
  @Input() videoUploadedAt?: string;
  @Input() videoResolution?: { width: number; height: number };

  @Input() isSaved = false;
  @Input() loadingSavedVideo = false;

  @Output() toggleSaved = new EventEmitter<void>();
  // @Output() addToPlaylist = new EventEmitter<MouseEvent>(); // Removed: now handled internally

  trimMode = false;
  trimStart: number | null = null;
  trimEnd: number | null = null;

  playlistModalVisible = false; // New property to control modal visibility

  constructor(private videoApi: VideoApiService) {}

  downloadVideo(): void {
    if (!this.videoId) return;
    const url = this.videoApi.getDownloadUrl(this.videoId);
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    a.click();
  }

  setTrimStart(): void {
    if (this.getCurrentTimeFn) {
      this.trimStart = this.getCurrentTimeFn();
      console.log('Set Start Time:', this.trimStart);
    }
  }

  setTrimEnd(): void {
    if (this.getCurrentTimeFn) {
      this.trimEnd = this.getCurrentTimeFn();
      console.log('Set End Time:', this.trimEnd);
    }
  }

  downloadTrimmed(): void {
    if (!this.videoId || this.trimStart == null) return;
    const url = this.videoApi.getTrimmedDownloadUrl(
      this.videoId,
      this.trimStart,
      this.trimEnd ?? undefined
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    a.click();
  }

  formatTime(seconds: number | null | undefined): string {
    if (seconds == null || isNaN(seconds)) return '–';

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  get trimmedDuration(): number | null {
    if (
      this.trimStart != null &&
      this.trimEnd != null &&
      this.trimEnd > this.trimStart
    ) {
      return this.trimEnd - this.trimStart;
    }
    return null;
  }

  toggleTrimMode(): void {
    this.trimMode = !this.trimMode;
    if (!this.trimMode) {
      this.trimStart = null;
      this.trimEnd = null;
    }
  }

  /**
   * Opens the playlist modal.
   */
  openPlaylistModal(): void {
    this.playlistModalVisible = true;
  }

  /**
   * Closes the playlist modal.
   */
  closePlaylistModal(): void {
    this.playlistModalVisible = false;
  }
}
