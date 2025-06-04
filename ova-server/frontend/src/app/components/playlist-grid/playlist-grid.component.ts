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

  onSelect(title: string): void {
    this.select.emit(title);
  }
}
