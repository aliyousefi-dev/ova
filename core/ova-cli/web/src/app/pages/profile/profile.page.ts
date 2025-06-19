import { Component, OnInit, ViewChild, inject } from '@angular/core'; // Import ViewChild
import {
  AuthApiService,
  UserProfile,
} from '../../services/api/auth-api.service';
import { WatchedApiService } from '../../services/api/watched-api.service'; // Import WatchedApiService
import { NavBarComponent } from '../../components/common/navbar/navbar.component';
import { ConfirmModalComponent } from '../../components/common/confirm-modal/confirm-modal.component'; // Import ConfirmModalComponent
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NavBarComponent, ConfirmModalComponent, CommonModule], // Add ConfirmModalComponent and CommonModule
  templateUrl: './profile.page.html',
})
export class ProfilePage implements OnInit {
  @ViewChild('confirmClearHistoryModal')
  confirmClearHistoryModal!: ConfirmModalComponent; // Reference the modal

  private authApi = inject(AuthApiService);
  private watchedApi = inject(WatchedApiService); // Inject WatchedApiService

  username = '';
  roles: string[] = [];

  ngOnInit(): void {
    this.authApi.getProfile().subscribe({
      next: (profile: UserProfile) => {
        this.username = profile.username;
        this.roles = profile.roles;
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
      },
    });
  }

  /**
   * Opens the confirmation modal for clearing watch history.
   */
  openClearWatchHistoryConfirm(): void {
    if (this.username) {
      this.confirmClearHistoryModal.open(
        'Are you sure you want to clear your entire watch history? This action cannot be undone.'
      );
    }
  }

  /**
   * Handles the confirmation to clear watch history.
   */
  clearWatchHistory(): void {
    if (this.username) {
      this.watchedApi.clearUserWatched(this.username).subscribe({
        next: (response) => {
          console.log('Watch history cleared:', response.message);
          // Optionally, provide user feedback (e.g., a toast notification)
          alert('Watch history cleared successfully!'); // Simple alert for now
        },
        error: (err) => {
          console.error('Failed to clear watch history:', err);
          // Optionally, provide user feedback about the error
          alert('Failed to clear watch history. Please try again.'); // Simple alert for now
        },
      });
    }
  }
}
