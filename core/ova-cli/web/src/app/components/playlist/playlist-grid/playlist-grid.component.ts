import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ViewChild,
} from '@angular/core';
import { PlaylistData } from '../../../data-types/playlist-data';
import { PlaylistCardComponent } from '../playlist-card/playlist-card.component';
import { CommonModule } from '@angular/common';
import { ConfirmModalComponent } from '../../common/confirm-modal/confirm-modal.component';

import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

import { PlaylistAPIService } from '../../../services/api/playlist-api.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-playlist-grid',
  templateUrl: './playlist-grid.component.html',
  imports: [
    PlaylistCardComponent,
    CommonModule,
    DragDropModule,
    ConfirmModalComponent,
  ],
  styleUrls: ['./playlist-grid.component.css'],
})
export class PlaylistGridComponent implements OnInit {
  @Input() playlists: PlaylistData[] = [];
  @Input() manageMode = false;

  @Output() select = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string[]>();

  @ViewChild(ConfirmModalComponent) confirmModal!: ConfirmModalComponent;

  selectedPlaylists = new Set<string>();

  selectedPlaylistTitle: string | null = null;

  username: string | null = null;

  constructor(private playlistApi: PlaylistAPIService) {}

  ngOnInit() {
    this.username = localStorage.getItem('username');
    if (!this.username) {
      console.warn(
        'No username found in localStorage. Playlist order updates will be disabled.'
      );
    }
  }

  drop(event: CdkDragDrop<PlaylistData[]>): void {
    if (!this.username) {
      console.error(
        'Cannot update playlist order: username not found in localStorage.'
      );
      return;
    }

    // Reorder the local playlists array based on drag-drop
    moveItemInArray(this.playlists, event.previousIndex, event.currentIndex);

    // Prepare an array of slugs in the new order
    const newOrderSlugs = this.playlists.map((pl) => pl.slug);

    // Send one API request with the new slug order array
    this.playlistApi
      .setPlaylistsOrder(this.username, newOrderSlugs)
      .pipe(
        catchError((err) => {
          console.error('Failed to update playlist order:', err);
          return of(null);
        })
      )
      .subscribe((res) => {
        if (res && res.status === 'success') {
          // Order updated successfully
        }
      });
  }

  get allSelected(): boolean {
    return (
      this.playlists.length > 0 &&
      this.selectedPlaylists.size === this.playlists.length
    );
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedPlaylists.clear();
    if (checked) {
      this.playlists.forEach((p) => this.selectedPlaylists.add(p.slug));
    }

    console.log(this.selectedPlaylists);
  }

  toggleSelection(slug: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedPlaylists.add(slug);
    } else {
      this.selectedPlaylists.delete(slug);
    }
  }

  onSelect(title: string): void {
    if (!this.manageMode) {
      this.selectedPlaylistTitle = title;
      this.select.emit(title);
    }
  }

  deleteSelected(): void {
    this.delete.emit(Array.from(this.selectedPlaylists));
    this.selectedPlaylists.clear();
  }

  isChecked(slug: string): boolean {
    return this.selectedPlaylists.has(slug);
  }

  toggleSelectionManual(slug: string): void {
    if (this.selectedPlaylists.has(slug)) {
      this.selectedPlaylists.delete(slug);
    } else {
      this.selectedPlaylists.add(slug);
    }
  }

  deleteButton() {
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
}
