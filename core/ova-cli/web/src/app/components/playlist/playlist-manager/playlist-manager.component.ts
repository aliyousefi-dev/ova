import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { PlaylistData } from '../../../data-types/playlist-data';
import { PlaylistAPIService } from '../../../services/api/playlist-api.service';
import { PlaylistGridComponent } from '../playlist-grid/playlist-grid.component';
import { PlaylistCreatorModalComponent } from '../playlist-creator-modal/playlist-creator-modal.component';
import { ConfirmModalComponent } from '../../common/confirm-modal/confirm-modal.component';
import { CommonModule } from '@angular/common';
import { ViewChild } from '@angular/core';
import { UtilsService } from '../../../services/utils.service';

@Component({
  selector: 'app-playlist-manager',
  templateUrl: './playlist-manager.component.html',
  imports: [
    CommonModule,
    PlaylistGridComponent,
    PlaylistCreatorModalComponent,
    ConfirmModalComponent,
  ],
})
export class PlaylistManagerComponent implements OnInit {
  // Get Confirm Modal from Html
  @ViewChild(ConfirmModalComponent) confirmModal!: ConfirmModalComponent;
  // Get Create Playlist Modal From Html
  @ViewChild(PlaylistCreatorModalComponent)
  createPlaylistModal!: PlaylistCreatorModalComponent;

  manageMode = false;
  username: string | null = null;
  loading = true;
  playlists: PlaylistData[] = [];
  selectedPlaylists = new Set<string>();
  selectedPlaylistTitle: string | null = null;

  ngOnInit(): void {
    // load username from local stroage
    this.username = this.utils.getUsername();
    this.FetchPlaylists();
  }

  constructor(
    private playlistApi: PlaylistAPIService,
    private utils: UtilsService
  ) {}

  // Get Playlist from Backend
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

  // Sort Based the Order Property
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

  // If Confirm Modal for Delete Called
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

  // Remove Playlist Deleted Locally
  handlePlaylistDeleted(deletedSlug: string) {
    // Remove playlist with matching slug from the array
    this.playlists = this.playlists.filter((pl) => pl.slug !== deletedSlug);

    // Also remove from selected set if present
    this.selectedPlaylists.delete(deletedSlug);

    // If the deleted playlist was selected, clear selection
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
    console.log('playlist created');
    this.FetchPlaylists();
  }
}
