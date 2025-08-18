import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlaylistAPIService } from '../../../services/ova-backend/playlist-api.service';
import { UtilsService } from '../../../services/utils.service';

@Component({
  selector: 'app-playlist-creator-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './playlist-creator-modal.component.html',
})
export class PlaylistCreatorModalComponent {
  isVisible = false;
  playlistName = '';
  creationError: string | null = null;

  @Output() created = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  constructor(
    private playlistApi: PlaylistAPIService,
    private utils: UtilsService
  ) {}

  submit(): void {
    const trimmed = this.playlistName.trim();
    if (trimmed) {
      this.playlistApi
        .createUserPlaylist(this.utils.getUsername()!, {
          title: trimmed,
          videoIds: [],
        })
        .subscribe({
          next: (res) => {
            if (res.status === 'success' && res.data) {
              this.created.emit(trimmed);
              this.closeModal();
            } else {
              this.creationError = res.message;
            }
          },
          error: (err) => {
            if (err.error?.error?.message) {
              this.creationError = err.error.error.message;
            } else if (err.message) {
              this.creationError = err.message;
            } else {
              this.creationError =
                'Failed to create playlist. Please try again.';
            }
          },
        });

      this.playlistName = '';
    }
  }

  onCancel(): void {
    console.log('cancel');
    this.playlistName = '';
    this.closeModal();
    this.cancelled.emit();
  }

  openModal() {
    this.isVisible = true;
    console.log('open');
  }
  closeModal() {
    this.isVisible = false;
  }
}
