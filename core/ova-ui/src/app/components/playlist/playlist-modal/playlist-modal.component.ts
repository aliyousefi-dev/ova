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
import { LucideAngularModule, Edit2 } from 'lucide-angular';

@Component({
  selector: 'app-playlist-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './playlist-modal.component.html',
})
export class PlaylistModalComponent implements OnChanges {
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

  // Lucide icon reference
  readonly Edit2 = Edit2;

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    // You can remove this entire method, as there's no need to sort
    // this.sortedPlaylists = [...this.playlists].sort(
    //   (a, b) => (a.Order ?? 0) - (b.Order ?? 0)
    // );
  }

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
