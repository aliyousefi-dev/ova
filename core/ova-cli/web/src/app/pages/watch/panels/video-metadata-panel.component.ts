import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  LucideAngularModule,
  Clock,
  CalendarArrowDown,
  FileVideo,
  Film,
  Download,
} from 'lucide-angular';
import { VideoApiService } from '../../../services/ova-backend/video-api.service';

@Component({
  selector: 'app-video-metadata-panel',
  standalone: true,
  imports: [CommonModule, DatePipe, LucideAngularModule],
  templateUrl: './video-metadata-panel.component.html',
  styles: [],
})
export class VideoMetadataPanelComponent {
  @Input() videoId?: string;
  @Input() videoDurationSeconds?: number;
  @Input() videoUploadedAt?: string;
  @Input() videoResolution?: { width: number; height: number };

  readonly VideoDurationIcon = Clock;
  readonly UploadTimeIcon = CalendarArrowDown;
  readonly ResolutionIcon = FileVideo;
  readonly FPSIcon = Film;
  readonly DownloadIcon = Download;

  constructor(private videoApi: VideoApiService) {}

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
}
