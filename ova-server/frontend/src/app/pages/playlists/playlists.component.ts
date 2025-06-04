import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { TopNavBarComponent } from '../../components/top-nav-bar/top-nav-bar.component';
import { PlaylistCreateModalComponent } from '../../components/playlist-create-modal/playlist-create-modal.component';

import { PlaylistAPIService } from '../../services/playlist-api.service';
import { PlaylistData } from '../../data-types/playlist-data';
import { PlaylistGridComponent } from '../../components/playlist-grid/playlist-grid.component';

@Component({
  selector: 'app-playlists',
  standalone: true,
  imports: [
    CommonModule,
    TopNavBarComponent,
    PlaylistGridComponent,
    PlaylistCreateModalComponent,
  ],
  templateUrl: './playlists.component.html',
})
export class PlaylistsComponent implements OnInit {
  playlists: PlaylistData[] = [];
  loading = true;
  private username: string | null = null;
  creationError: string | null = null;

  constructor(
    private playlistapi: PlaylistAPIService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username');
    if (!this.username) {
      console.warn('⚠️ No username found in localStorage');
      this.loading = false;
      return;
    }
    this.loadPlaylists();
  }

  private loadPlaylists(): void {
    this.playlistapi.getUserPlaylists(this.username!).subscribe({
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
    this.playlists.sort((a, b) =>
      a.title.toLowerCase().localeCompare(b.title.toLowerCase())
    );
  }

  onSelectPlaylist(title: string): void {
    this.router.navigate(['/playlists', title]);
  }

  createNewPlaylist(): void {
    this.creationError = null; // reset previous error
    const title = prompt('Enter playlist name:');
    if (!title || !title.trim()) return;

    const trimmedTitle = title.trim();

    this.playlistapi
      .createUserPlaylist(this.username!, {
        title: trimmedTitle,
        videoIds: [],
      })
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

  onDeletePlaylists(titles: string[]): void {
    if (!titles.length) return;

    if (!confirm(`Delete ${titles.length} playlist(s)?`)) return;

    // Track deletions and update UI after all succeed
    const deleteObservables = titles.map((title) =>
      this.playlistapi.deleteUserPlaylistBySlug(this.username!, title)
    );

    // Simple approach: subscribe to each separately and update playlists array
    // You could improve with forkJoin to wait all complete if preferred
    titles.forEach((title) => {
      this.playlistapi
        .deleteUserPlaylistBySlug(this.username!, title)
        .subscribe({
          next: () => {
            this.playlists = this.playlists.filter((p) => p.title !== title);
          },
          error: (err) => {
            console.error(`Failed to delete playlist "${title}":`, err);
            alert(`Failed to delete playlist "${title}".`);
          },
        });
    });
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
    this.playlistapi
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
