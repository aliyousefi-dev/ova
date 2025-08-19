import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ViewChild,
} from '@angular/core';
import { PlaylistData } from '../../../data-types/playlist-data';
import { PlaylistCardComponent } from '../../blocks/playlist-card/playlist-card.component';
import { CommonModule } from '@angular/common';
import { PlaylistSummary } from '../../../services/ova-backend/playlist-api.service';

import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

import { PlaylistAPIService } from '../../../services/ova-backend/playlist-api.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-playlists-view',
  templateUrl: './playlists-view.component.html',
  imports: [PlaylistCardComponent, CommonModule, DragDropModule],
  styleUrls: ['./playlists-view.component.css'],
})
export class PlaylistGridComponent implements OnInit {
  @Input() playlists: PlaylistSummary[] = [];
  @Input() manageMode = false;

  @Output() select = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string[]>();

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

  drop(event: CdkDragDrop<PlaylistSummary[]>): void {
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

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedPlaylists.clear();
    if (checked) {
      this.playlists.forEach((p) => this.selectedPlaylists.add(p.slug));
    }

    console.log(this.selectedPlaylists);
  }

  togglePlaylistSelection(slug: string, event: Event): void {
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

  OnPlaylistDeleted(deletedSlug: string) {
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
