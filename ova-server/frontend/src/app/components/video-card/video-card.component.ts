import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { APIService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { PlaylistModalComponent } from '../playlist-modal/playlist-modal.component';

@Component({
  selector: 'app-video-card',
  templateUrl: './video-card.component.html',
  imports: [CommonModule, RouterModule, FormsModule, PlaylistModalComponent],
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
  @Input() uploadedAt!: string;

  hovering = false;
  savingFavorite = false;

  playlistModalVisible = false;

  playlists: { title: string; slug: string; checked: boolean }[] = [];
  originalPlaylists: { title: string; slug: string; checked: boolean }[] = [];

  constructor(public apiService: APIService) {}

  // Open modal, load playlists and set checked states
  addToPlaylist(event: MouseEvent) {
    event.stopPropagation();
    if (!this.username) return;

    this.apiService.getUserPlaylists(this.username).subscribe((pls) => {
      // Create a fresh playlist array with checked = false initially
      const checkList = pls.map((p) => ({ ...p, checked: false }));

      // Fetch each playlist's videos to determine if video is inside
      Promise.all(
        checkList.map(
          (playlist) =>
            new Promise<void>((resolve) => {
              this.apiService
                .getUserPlaylistBySlug(this.username, playlist.slug)
                .subscribe((plData) => {
                  playlist.checked = plData.videoIds.includes(this.videoId);
                  resolve();
                });
            })
        )
      ).then(() => {
        this.playlists = checkList;
        // Make a deep copy for original state to compare later
        this.originalPlaylists = checkList.map((p) => ({ ...p }));
        this.playlistModalVisible = true;
      });
    });
  }

  // Handle modal close and apply playlist changes (add/remove video)
  closePlaylistModal(
    updatedPlaylists: { title: string; slug: string; checked: boolean }[]
  ) {
    this.playlistModalVisible = false;
    if (!this.username) return;

    updatedPlaylists.forEach((playlist) => {
      // Find original checked state from originalPlaylists, not current playlists
      const original = this.originalPlaylists.find(
        (p) => p.slug === playlist.slug
      );
      if (!original) return;

      if (playlist.checked && !original.checked) {
        // Video was not in playlist, now should be added
        this.apiService
          .addVideoToPlaylist(this.username, playlist.slug, this.videoId)
          .subscribe();
      } else if (!playlist.checked && original.checked) {
        // Video was in playlist, now should be removed
        this.apiService
          .deleteVideoFromPlaylist(this.username, playlist.slug, this.videoId)
          .subscribe();
      }
    });
  }

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
    if (!this.uploadedAt) return 'unknown';

    const addedDate = new Date(this.uploadedAt);
    const now = new Date();
    const diffMs = now.getTime() - addedDate.getTime();

    if (diffMs < 0) return 'just now'; // In case uploadedAt is future date

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  }
}
