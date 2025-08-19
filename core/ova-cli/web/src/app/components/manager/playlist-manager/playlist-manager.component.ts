import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { PlaylistData } from '../../../data-types/playlist-data';
import { PlaylistAPIService } from '../../../services/ova-backend/playlist-api.service';
import { PlaylistGridComponent } from '../../containers/playlists-view/playlists-view.component';
import { PlaylistCreatorModalComponent } from '../../pop-ups/playlist-creator-modal/playlist-creator-modal.component';
import { ConfirmModalComponent } from '../../pop-ups/confirm-modal/confirm-modal.component';
import { UtilsService } from '../../../services/utils.service';

@Component({
  selector: 'app-playlist-manager',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PlaylistGridComponent,
    PlaylistCreatorModalComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './playlist-manager.component.html',
})
export class PlaylistManagerComponent implements OnInit {
  @ViewChild(ConfirmModalComponent) confirmModal!: ConfirmModalComponent;
  @ViewChild(PlaylistCreatorModalComponent)
  createPlaylistModal!: PlaylistCreatorModalComponent;

  manageMode = false;
  username: string | null = null;
  loading = true;
  playlists: PlaylistData[] = [];
  selectedPlaylists = new Set<string>();
  selectedPlaylistTitle: string | null = null;

  constructor(
    private playlistApi: PlaylistAPIService,
    private utils: UtilsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.username = this.utils.getUsername();
    this.FetchPlaylists();
  }

  private FetchPlaylists(): void {
    this.playlistApi.getUserPlaylists(this.username!).subscribe({
      next: (response) => {
        this.playlists = response.data.playlists ?? [];
        this.sortPlaylists();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load playlists:', err);
        this.loading = false;
      },
    });
  }

  private sortPlaylists(): void {
    this.playlists.sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0));
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedPlaylists.clear();
    if (checked) {
      this.playlists.forEach((p) => this.selectedPlaylists.add(p.slug));
    }
    console.log(this.selectedPlaylists);
  }

  toggleManageMode(): void {
    this.manageMode = !this.manageMode;
  }

  onDeleteButton() {
    this.confirmModal.open(
      `Are you sure you want to delete all selected playlists? This action cannot be undone.`
    );
  }

  confirmDelete() {
    this.selectedPlaylists.forEach((playlist_slug) => {
      this.playlistApi
        .deleteUserPlaylistBySlug(this.username!, playlist_slug)
        .subscribe({
          next: () => {
            this.handlePlaylistDeleted(playlist_slug);
          },
          error: (err) => {
            alert('Failed to delete playlist: ' + err.message);
          },
        });
    });
  }

  handlePlaylistDeleted(deletedSlug: string) {
    this.playlists = this.playlists.filter((pl) => pl.slug !== deletedSlug);
    this.selectedPlaylists.delete(deletedSlug);
    if (this.selectedPlaylistTitle) {
      const deletedPlaylist = this.playlists.find(
        (pl) => pl.title === this.selectedPlaylistTitle
      );
      if (!deletedPlaylist) {
        this.selectedPlaylistTitle = null;
      }
    }
  }

  OnCreatePlaylistButton(): void {
    this.createPlaylistModal.openModal();
  }

  onPlaylistCreated(title: string): void {
    this.FetchPlaylists();
  }
}
