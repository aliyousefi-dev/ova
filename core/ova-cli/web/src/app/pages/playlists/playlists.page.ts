import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { NavBarComponent } from '../../components/common/navbar/navbar.component';
import { PlaylistCreateModalComponent } from '../../components/playlist/playlist-create-modal/playlist-create-modal.component';

import { PlaylistAPIService } from '../../services/api/playlist-api.service';
import { PlaylistData } from '../../data-types/playlist-data';
import { PlaylistGridComponent } from '../../components/playlist/playlist-grid/playlist-grid.component';

import { ToastComponent } from '../../components/common/toast/toast.component';

@Component({
  selector: 'app-playlists',
  standalone: true,
  imports: [
    CommonModule,
    NavBarComponent,
    PlaylistGridComponent,
    PlaylistCreateModalComponent,
    ToastComponent,
  ],
  templateUrl: './playlists.page.html',
})
export class PlaylistsPage implements OnInit {
  playlists: PlaylistData[] = [];
  loading = true;
  manageMode = false; // NEW
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
    this.playlists.sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0));
  }

  onSelectPlaylist(title: string): void {
    if (!this.manageMode) {
      this.router.navigate(['/playlists', title]);
    }
  }

  toggleManageMode(): void {
    this.manageMode = !this.manageMode;
  }

  onDeletePlaylists(slugs: string[]): void {
    if (!slugs.length) return;
    if (!confirm(`Delete ${slugs.length} playlist(s)?`)) return;

    slugs.forEach((slug) => {
      this.playlistapi
        .deleteUserPlaylistBySlug(this.username!, slug)
        .subscribe({
          next: () => {
            this.playlists = this.playlists.filter((p) => p.slug !== slug);
          },
          error: (err) => {
            console.error(`Failed to delete playlist "${slug}":`, err);
            alert(`Failed to delete playlist "${slug}".`);
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
