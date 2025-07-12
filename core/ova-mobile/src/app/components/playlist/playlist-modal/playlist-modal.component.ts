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
import { PlaylistData } from '../../../services/api/api-types';
import { PlaylistAPIService } from '../../../services/api/playlist-api.service';
import { UtilsService } from '../../../services/utils.service';

// Define PlaylistWrapper interface outside the component class
export interface PlaylistWrapper extends PlaylistData {
  checked: boolean;
}

@Component({
  selector: 'app-playlist-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './playlist-modal.component.html',
})
export class PlaylistModalComponent implements OnChanges {
  @Input() showModal = false;
  @Input() selectedVideoId!: string; // Input for the video ID
  // @Input() username!: string; // Removed: username will now be fetched via UtilsService

  // Internal state for playlists
  playlists: PlaylistWrapper[] = [];
  originalPlaylists: PlaylistWrapper[] = []; // To track initial state for comparison

  @Output() close = new EventEmitter<void>(); // No longer emits data, just signals closure

  private username: string | null = null; // Internal property to store the fetched username

  constructor(
    private router: Router,
    private playlistapi: PlaylistAPIService,
    private utilsService: UtilsService // Inject UtilsService
  ) {
    this.username = this.utilsService.getUsername(); // Fetch username on component initialization
  }

  // ngOnChanges will detect changes to input properties
  ngOnChanges(changes: SimpleChanges): void {
    // Check if showModal changed to true and selectedVideoId is available
    // Also ensure username is available before loading playlists
    if (
      changes['showModal'] &&
      changes['showModal'].currentValue === true &&
      this.selectedVideoId &&
      this.username
    ) {
      this.loadPlaylists(); // Load playlists when the modal is opened
    }
    // If showModal changes to false, clear playlists or reset state
    if (changes['showModal'] && changes['showModal'].currentValue === false) {
      this.playlists = [];
      this.originalPlaylists = [];
    }
  }

  /**
   * Fetches user playlists and checks if the selected video is in each playlist.
   */
  private loadPlaylists(): void {
    if (!this.username || !this.selectedVideoId) {
      console.error(
        'Username or selectedVideoId is missing for loading playlists.'
      );
      // It's good practice to close the modal or show an error to the user if critical data is missing.
      // For now, we'll just log the error.
      return;
    }

    this.playlistapi.getUserPlaylists(this.username).subscribe({
      next: (response) => {
        const pls = response.data.playlists;
        // Initialize playlists with checked status as false
        const checkList: PlaylistWrapper[] = pls.map((p: PlaylistData) => ({
          ...p,
          checked: false,
        }));

        // Use Promise.all to wait for all individual playlist checks to complete
        Promise.all(
          checkList.map(
            (playlist) =>
              new Promise<void>((resolve) => {
                this.playlistapi
                  .getUserPlaylistBySlug(this.username as string, playlist.slug) // Cast to string as we've checked for null
                  .subscribe({
                    next: (plData) => {
                      playlist.checked = plData.data.videoIds.includes(
                        this.selectedVideoId
                      );
                      resolve();
                    },
                    error: (err) => {
                      console.error(
                        `Error fetching playlist ${playlist.slug}:`,
                        err
                      );
                      playlist.checked = false; // Default to unchecked on error
                      resolve(); // Resolve even on error to allow Promise.all to complete
                    },
                  });
              })
          )
        )
          .then(() => {
            this.playlists = checkList;
            // Create a deep copy to track original state for comparison during save
            this.originalPlaylists = checkList.map((p) => ({ ...p }));
            console.log('Playlists loaded:', this.playlists);
          })
          .catch((err) => {
            console.error('Error in Promise.all for playlist checks:', err);
          });
      },
      error: (err) => {
        console.error('Error fetching user playlists:', err);
      },
    });
  }

  /**
   * Closes the modal without saving changes.
   */
  closeModal(): void {
    this.close.emit(); // Just emit close event
  }

  /**
   * Saves changes to playlists by adding/removing the video.
   */
  save(): void {
    if (!this.username || !this.selectedVideoId) {
      console.error(
        'Username or selectedVideoId is missing for saving playlists.'
      );
      this.close.emit(); // Close modal even if data is missing
      return;
    }

    this.playlists.forEach((playlist) => {
      const original = this.originalPlaylists.find(
        (p) => p.slug === playlist.slug
      );

      if (!original) {
        console.warn(`Original playlist not found for slug: ${playlist.slug}`);
        return;
      }

      // If playlist is now checked but was not originally, add the video
      if (playlist.checked && !original.checked) {
        this.playlistapi
          .addVideoToPlaylist(
            this.username as string,
            playlist.slug,
            this.selectedVideoId
          ) // Cast to string
          .subscribe({
            next: () =>
              console.log(
                `Added video ${this.selectedVideoId} to playlist ${playlist.slug}`
              ),
            error: (err) =>
              console.error(
                `Error adding video to playlist ${playlist.slug}:`,
                err
              ),
          });
      }
      // If playlist is now unchecked but was originally checked, remove the video
      else if (!playlist.checked && original.checked) {
        this.playlistapi
          .deleteVideoFromPlaylist(
            this.username as string, // Cast to string
            playlist.slug,
            this.selectedVideoId
          )
          .subscribe({
            next: () =>
              console.log(
                `Removed video ${this.selectedVideoId} from playlist ${playlist.slug}`
              ),
            error: (err) =>
              console.error(
                `Error removing video from playlist ${playlist.slug}:`,
                err
              ),
          });
      }
    });
    this.close.emit(); // Emit close event after initiating saves
  }

  /**
   * Tracks playlists by slug for NgFor optimization.
   */
  trackBySlug(index: number, playlist: { slug: string }): string {
    return playlist.slug;
  }

  /**
   * Navigates to the playlists management page.
   */
  navigateToPlaylists(): void {
    this.router.navigate(['/playlists']);
  }
}
