import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Download } from 'lucide-angular';
import { VideoApiService } from '../../../services/api/video-api.service';

@Component({
  selector: 'app-video-download-panel',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './video-download-panel.component.html',
  styles: [],
})
export class VideoDownloadPanelComponent {
  @Input() videoId?: string;
  @Input() getCurrentTimeFn?: () => number;
  readonly DownloadIcon = Download;

  trimMode = false;
  trimStart: number | null = null;
  trimEnd: number | null = null;

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
}
