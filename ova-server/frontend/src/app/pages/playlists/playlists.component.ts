import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { TopNavBarComponent } from '../../components/top-nav-bar/top-nav-bar.component';

import { PlaylistAPIService } from '../../services/playlist-api.service';
import { PlaylistData } from '../../data-types/playlist-data';
import { PlaylistGridComponent } from '../../components/playlist-grid/playlist-grid.component';

@Component({
  selector: 'app-playlists',
  standalone: true,
  imports: [CommonModule, TopNavBarComponent, PlaylistGridComponent],
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
          // Try to extract meaningful error message from the backend response
          if (err.error && err.error.error && err.error.error.message) {
            this.creationError = err.error.error.message;
          } else if (err.message) {
            // fallback to generic error message from HttpErrorResponse
            this.creationError = err.message;
          } else {
            this.creationError = 'Failed to create playlist. Please try again.';
          }
        },
      });
  }
}
