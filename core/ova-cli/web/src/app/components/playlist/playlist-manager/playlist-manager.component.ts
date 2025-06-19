import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { PlaylistData } from '../../../data-types/playlist-data';
import { PlaylistAPIService } from '../../../services/api/playlist-api.service';
import { PlaylistGridComponent } from '../playlist-grid/playlist-grid.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-playlist-manager',
  templateUrl: './playlist-manager.component.html',
  imports: [CommonModule, PlaylistGridComponent],
})
export class PlaylistManagerComponent implements OnInit {
  manageMode = false;
  username: string | null = null;
  loading = true;
  playlists: PlaylistData[] = [];
  creationError: string | null = null;

  ngOnInit(): void {
    this.username = localStorage.getItem('username');
    if (!this.username) {
      console.warn(
        'No username found in localStorage. Playlist order updates will be disabled.'
      );
    }
    this.loadPlaylists();
  }

  constructor(private playlistApi: PlaylistAPIService) {}

  private loadPlaylists(): void {
    this.playlistApi.getUserPlaylists(this.username!).subscribe({
      next: (response) => {
        this.playlists = response.data.playlists ?? [];
        this.sortPlaylists();
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Failed to load playlists:', err);
        this.loading = false;
      },
    });
  }

  private sortPlaylists(): void {
    this.playlists.sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0));
  }

  toggleManageMode(): void {
    this.manageMode = !this.manageMode;
  }

  showCreateModal = false;

  openCreateModal(): void {
    this.creationError = null;
    this.showCreateModal = true;
  }

  onModalClose(): void {
    this.showCreateModal = false;
  }

  onModalCreate(title: string): void {
    this.showCreateModal = false;
    this.playlistApi
      .createUserPlaylist(this.username!, { title, videoIds: [] })
      .subscribe({
        next: (res) => {
          if (res.status === 'success' && res.data) {
            this.playlists.push(res.data);
            this.sortPlaylists();
          } else {
            this.creationError = res.message;
          }
        },
        error: (err) => {
          if (err.error?.error?.message) {
            this.creationError = err.error.error.message;
          } else if (err.message) {
            this.creationError = err.message;
          } else {
            this.creationError = 'Failed to create playlist. Please try again.';
          }
        },
      });
  }
}
