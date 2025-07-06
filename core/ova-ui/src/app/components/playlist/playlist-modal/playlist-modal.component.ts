import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-playlist-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './playlist-modal.component.html',
})
export class PlaylistModalComponent {
  @Input() showModal = false;

  @Input() playlists: {
    title: string;
    slug: string;
    checked: boolean;
    Order?: number;
  }[] = [];

  @Output() close = new EventEmitter<
    { title: string; slug: string; checked: boolean }[]
  >();

  constructor(private router: Router) {}

  closeModal() {
    this.close.emit(this.playlists); // Emit the original playlists array instead of sortedPlaylists
  }

  save() {
    this.close.emit(this.playlists); // Emit the original playlists array
  }

  trackBySlug(index: number, playlist: { slug: string }) {
    return playlist.slug;
  }

  navigateToPlaylists() {
    this.router.navigate(['/playlists']);
  }
}
