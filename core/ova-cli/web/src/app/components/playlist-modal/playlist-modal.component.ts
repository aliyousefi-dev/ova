import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-playlist-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './playlist-modal.component.html',
})
export class PlaylistModalComponent {
  @Input() visible = false;
  @Input() playlists: { title: string; slug: string; checked: boolean }[] = [];

  @Output() close = new EventEmitter<
    { title: string; slug: string; checked: boolean }[]
  >();

  closeModal() {
    this.close.emit(this.playlists); // emit without saving changes explicitly
  }

  save() {
    // emit playlists and close modal
    this.close.emit(this.playlists);
  }

  trackBySlug(index: number, playlist: { slug: string }) {
    return playlist.slug;
  }
}
