import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaylistData } from '../../data-types/playlist-data';
import { PlaylistCardComponent } from '../playlist-card/playlist-card.component';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-playlist-grid',
  standalone: true,
  imports: [CommonModule, PlaylistCardComponent, DragDropModule],
  templateUrl: './playlist-grid.component.html',
  styleUrls: ['./playlist-grid.component.css'],
})
export class PlaylistGridComponent {
  @Input() playlists: PlaylistData[] = [];
  @Input() manageMode = false;

  @Output() select = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string[]>();

  selectedPlaylists = new Set<string>();

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

  drop(event: CdkDragDrop<PlaylistData[]>) {
    moveItemInArray(this.playlists, event.previousIndex, event.currentIndex);
  }
}
