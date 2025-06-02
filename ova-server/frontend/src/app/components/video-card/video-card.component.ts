import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-video-card',
  templateUrl: './video-card.component.html',
  imports: [CommonModule, RouterModule],
  standalone: true,
})
export class VideoCardComponent {
  @Input() videoId!: string;
  @Input() title!: string;
  @Input() thumbnailUrl!: string;
  @Input() previewUrl!: string;
  @Input() duration!: number;
  @Input() tags: string[] = [];

  hovering = false;

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
