import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlaylistModalComponent } from '../playlist-modal/playlist-modal.component';
import { PlaylistAPIService } from '../../services/playlist-api.service';
import { VideoApiService } from '../../services/video-api.service';
import { FavoriteApiService } from '../../services/favorite-api.service';
import { VideoData } from '../../data-types/video-data';

@Component({
  selector: 'app-video-card',
  templateUrl: './video-card.component.html',
  imports: [CommonModule, RouterModule, FormsModule, PlaylistModalComponent],
  standalone: true,
})
export class VideoCardComponent {
  @Input() video!: VideoData;
  @Input() isFavorite: boolean = false;
  @Input() username: string = '';

  hovering = false;
  savingFavorite = false;

  playlistModalVisible = false;
  playlists: { title: string; slug: string; checked: boolean }[] = [];
  originalPlaylists: { title: string; slug: string; checked: boolean }[] = [];

  constructor(
    private playlistapi: PlaylistAPIService,
    private favoriteapi: FavoriteApiService,
    private videoapi: VideoApiService
  ) {}

  getThumbnailUrl(): string {
    return this.videoapi.getThumbnailUrl(this.video.videoId);
  }

  getPreviewUrl(): string {
    return this.videoapi.getPreviewUrl(this.video.videoId);
  }

  addToPlaylist(event: MouseEvent) {
    event.stopPropagation();
    if (!this.username) return;

    this.playlistapi.getUserPlaylists(this.username).subscribe((response) => {
      const pls = response.data.playlists;
      const checkList = pls.map((p) => ({ ...p, checked: false }));

      Promise.all(
        checkList.map(
          (playlist) =>
            new Promise<void>((resolve) => {
              this.playlistapi
                .getUserPlaylistBySlug(this.username, playlist.slug)
                .subscribe((plData) => {
                  playlist.checked = plData.data.videoIds.includes(
                    this.video.videoId
                  );
                  resolve();
                });
            })
        )
      ).then(() => {
        this.playlists = checkList;
        this.originalPlaylists = checkList.map((p) => ({ ...p }));
        this.playlistModalVisible = true;
      });
    });
  }

  closePlaylistModal(
    updatedPlaylists: { title: string; slug: string; checked: boolean }[]
  ) {
    this.playlistModalVisible = false;
    if (!this.username) return;

    updatedPlaylists.forEach((playlist) => {
      const original = this.originalPlaylists.find(
        (p) => p.slug === playlist.slug
      );
      if (!original) return;

      if (playlist.checked && !original.checked) {
        this.playlistapi
          .addVideoToPlaylist(this.username, playlist.slug, this.video.videoId)
          .subscribe();
      } else if (!playlist.checked && original.checked) {
        this.playlistapi
          .deleteVideoFromPlaylist(
            this.username,
            playlist.slug,
            this.video.videoId
          )
          .subscribe();
      }
    });
  }

  toggleFavorite(event: MouseEvent) {
    event.stopPropagation();
    if (!this.username) return;

    this.savingFavorite = true;
    this.favoriteapi.getUserFavorites(this.username).subscribe((favData) => {
      let updatedFavorites = new Set(favData.favorites);

      if (this.isFavorite) {
        updatedFavorites.delete(this.video.videoId);
      } else {
        updatedFavorites.add(this.video.videoId);
      }

      this.favoriteapi
        .updateUserFavorites(this.username, Array.from(updatedFavorites))
        .subscribe((newData) => {
          this.isFavorite = newData.favorites.includes(this.video.videoId);
          this.savingFavorite = false;
        });
    });
  }

  download(event: MouseEvent) {
    event.stopPropagation();
    const streamUrl = this.videoapi.getDownloadUrl(this.video.videoId);
    const anchor = document.createElement('a');
    anchor.href = streamUrl;
    anchor.download = `${this.video.title}.mp4`;
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
    if (!this.video.uploadedAt) return 'unknown';

    const addedDate = new Date(this.video.uploadedAt);
    const now = new Date();
    const diffMs = now.getTime() - addedDate.getTime();
    if (diffMs < 0) return 'just now';

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
