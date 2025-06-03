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
  @Input() isFavorite: boolean = false;
  @Input() username: string = '';

  hovering = false;
  savingFavorite = false;

  constructor(public apiService: APIService) {}

  toggleFavorite(event: MouseEvent) {
    event.stopPropagation();

    if (!this.username) return;

    this.savingFavorite = true;
    this.apiService.getUserFavorites(this.username).subscribe((favData) => {
      let updatedFavorites = new Set(favData.favorites);

      if (this.isFavorite) {
        updatedFavorites.delete(this.videoId);
      } else {
        updatedFavorites.add(this.videoId);
      }

      this.apiService
        .updateUserFavorites(this.username, Array.from(updatedFavorites))
        .subscribe((newData) => {
          this.isFavorite = newData.favorites.includes(this.videoId);
          this.savingFavorite = false;
        });
    });
  }

  download(event: MouseEvent) {
    event.stopPropagation();
    const streamUrl = this.apiService.getDownloadUrl(this.videoId);
    const anchor = document.createElement('a');
    anchor.href = streamUrl;
    anchor.download = `${this.title}.mp4`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  addToPlaylist(event: MouseEvent) {
    event.stopPropagation();
    console.log('Add to Playlist', this.title);
    // TODO
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
    const addedDate = new Date(Date.now()); // TODO: use real addedAt timestamp
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
