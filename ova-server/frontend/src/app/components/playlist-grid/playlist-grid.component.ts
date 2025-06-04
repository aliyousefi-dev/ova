import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaylistData } from '../../data-types/playlist-data';
import { PlaylistCardComponent } from '../playlist-card/playlist-card.component';

@Component({
  selector: 'app-playlist-grid',
  standalone: true,
  imports: [CommonModule, PlaylistCardComponent],
  templateUrl: './playlist-grid.component.html',
})
export class PlaylistGridComponent {
  @Input() playlists: PlaylistData[] = [];

  @Output() select = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string[]>(); // Emit selected playlist titles for deletion

  selectedPlaylists = new Set<string>();

  get allSelected(): boolean {
    return (
      this.playlists.length > 0 &&
      this.selectedPlaylists.size === this.playlists.length
    );
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.playlists.forEach((p) => this.selectedPlaylists.add(p.title));
    } else {
      this.selectedPlaylists.clear();
    }
  }

  toggleSelection(title: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedPlaylists.add(title);
    } else {
      this.selectedPlaylists.delete(title);
    }
  }

  onSelect(title: string): void {
    this.select.emit(title);
  }

  deleteSelected(): void {
    // Emit the array of selected playlist titles for deletion
    this.delete.emit(Array.from(this.selectedPlaylists));
    // Clear selection after emitting delete event
    this.selectedPlaylists.clear();
  }
}
