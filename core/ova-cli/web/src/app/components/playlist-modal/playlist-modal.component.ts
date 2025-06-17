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
export class PlaylistModalComponent implements OnChanges {
  @Input() visible = false;

  // Original playlists input
  @Input() playlists: {
    title: string;
    slug: string;
    checked: boolean;
    Order?: number;
  }[] = [];

  // Internal sorted copy
  sortedPlaylists: {
    title: string;
    slug: string;
    checked: boolean;
    Order?: number;
  }[] = [];

  @Output() close = new EventEmitter<
    { title: string; slug: string; checked: boolean }[]
  >();

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['playlists']) {
      this.sortedPlaylists = [...this.playlists].sort(
        (a, b) => (a.Order ?? 0) - (b.Order ?? 0)
      );
    }
  }

  closeModal() {
    this.close.emit(this.sortedPlaylists);
  }

  save() {
    this.close.emit(this.sortedPlaylists);
  }

  trackBySlug(index: number, playlist: { slug: string }) {
    return playlist.slug;
  }

  navigateToPlaylists() {
    this.router.navigate(['/playlists']);
  }
}
