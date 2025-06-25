import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LucideAngularModule, Clock, Calendar, Square } from 'lucide-angular';

@Component({
  selector: 'app-video-metadata-panel',
  standalone: true,
  imports: [CommonModule, DatePipe, LucideAngularModule],
  templateUrl: './video-metadata-panel.component.html',
  styles: [],
})
export class VideoMetadataPanelComponent {
  @Input() videoDurationSeconds?: number;
  @Input() videoUploadedAt?: string;
  @Input() videoResolution?: { width: number; height: number };

  readonly Clock = Clock;
  readonly Calendar = Calendar;
  readonly Square = Square;

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
