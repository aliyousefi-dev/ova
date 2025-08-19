import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaylistData } from '../../../data-types/playlist-data';
import { VideoApiService } from '../../../services/ova-backend/video-api.service';
import { PlaylistAPIService } from '../../../services/ova-backend/playlist-api.service';
import { ConfirmModalComponent } from '../../pop-ups/confirm-modal/confirm-modal.component';
import { EditPlaylistModalComponent } from '../../pop-ups/edit-playlist-modal/edit-playlist-modal.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-playlist-card',
  imports: [CommonModule, ConfirmModalComponent, EditPlaylistModalComponent],
  standalone: true,
  templateUrl: './playlist-card.component.html',
})
export class PlaylistCardComponent implements OnInit {
  @Input() playlist!: PlaylistData;
  @Output() playlistDeleted = new EventEmitter<string>();

  @ViewChild(ConfirmModalComponent) confirmModal!: ConfirmModalComponent;

  username: string | null = null;

  // State for edit modal visibility and form values
  editModalVisible = false;
  editTitle = '';
  editDescription = '';

  constructor(
    private videoapi: VideoApiService,
    private playlistapi: PlaylistAPIService,
    private router: Router
  ) {
    this.username = localStorage.getItem('username');
    if (!this.username) {
      console.warn('Username not found in localStorage');
      this.username = ''; // fallback to empty string to avoid null issues
    }
  }

  ngOnInit(): void {
    // Load the first video from the playlist to show its thumbnail as header
    const firstVideoId = this.playlist.videoIds?.[0];
  }

  getThumbnailUrl(): string {
    const videoId =
      this.playlist.videoIds && this.playlist.videoIds.length > 0
        ? this.playlist.videoIds[0]
        : null;

    return videoId ? this.videoapi.getThumbnailUrl(videoId) : '';
  }

  goToPlaylistContent() {
    this.router.navigate(['/playlists', this.playlist.slug]);
  }

  onDelete() {
    if (!this.username) {
      alert('No user logged in.');
      return;
    }
    this.confirmModal.open(
      `Are you sure you want to delete the playlist "${this.playlist.title}"? This action cannot be undone.`
    );
  }

  confirmDelete() {
    this.playlistapi
      .deleteUserPlaylistBySlug(this.username!, this.playlist.slug)
      .subscribe({
        next: () => {
          this.playlistDeleted.emit(this.playlist.slug);
        },
        error: (err) => {
          alert('Failed to delete playlist: ' + err.message);
        },
      });
  }

  onEdit() {
    this.editTitle = this.playlist.title;
    this.editDescription = this.playlist.description || '';
    this.editModalVisible = true;
  }

  onEditCancelled() {
    this.editModalVisible = false;
  }

  onEditSaved(update: { title: string; description: string }) {
    if (!this.username) {
      alert('No user logged in.');
      return;
    }
    this.playlistapi
      .updateUserPlaylistInfo(this.username, this.playlist.slug, update)
      .subscribe({
        next: (res) => {
          if (res.status === 'success' && res.data) {
            this.playlist.title = res.data.title;
            this.playlist.description = res.data.description;
            this.editModalVisible = false;
          } else {
            alert('Failed to update playlist info');
          }
        },
        error: (err) => {
          alert('Failed to update playlist info: ' + err.message);
        },
      });
  }
}
