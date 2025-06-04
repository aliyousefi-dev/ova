import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PlaylistInput {
  title: string;
  description: string;
  thumbnailUrl?: string; // single thumbnail URL now
}

@Component({
  selector: 'app-playlist-card',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './playlist-card.component.html',
})
export class PlaylistCardComponent {
  @Input() playlist!: PlaylistInput;

  @Output() select = new EventEmitter<void>();

  onSelect() {
    this.select.emit();
  }
}
