import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { APIService } from '../../services/api.service';

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

  constructor(public apiService: APIService) {}

  addToFavorites(event: MouseEvent) {
    event.stopPropagation(); // prevent card click
    console.log('Add to Favorites', this.title);
    // TODO: call backend or emit event
  }

  download(event: MouseEvent) {
    event.stopPropagation(); // prevent card click

    const streamUrl = this.apiService.getDownloadUrl(this.videoId);
    const anchor = document.createElement('a');
    anchor.href = streamUrl;
    anchor.download = `${this.title}.mp4`; // Adjust the extension as needed
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  addToPlaylist(event: MouseEvent) {
    event.stopPropagation();
    console.log('Add to Playlist', this.title);
    // TODO: call backend or emit event
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
    const addedDate = new Date(Date.now()); // assuming you have videoAddedAt
    const now = new Date();
    const diffMs = now.getTime() - addedDate.getTime();
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return `just now`;
  }
}
