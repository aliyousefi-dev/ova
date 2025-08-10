import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ConfirmModalComponent } from '../../components/pop-ups/confirm-modal/confirm-modal.component';

import {
  AuthApiService,
  UserProfile,
} from '../../services/api/auth-api.service';
import { WatchedApiService } from '../../services/api/watched-api.service';

// Define session type
interface SessionEntry {
  id: string;
  ip: string;
  device?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './profile.page.html',
})
export class ProfilePage implements OnInit {
  @ViewChild('confirmClearHistoryModal')
  confirmClearHistoryModal!: ConfirmModalComponent;

  private authApi = inject(AuthApiService);
  private watchedApi = inject(WatchedApiService);

  activeTab: string = 'overview';
  username = '';
  roles: string[] = [];

  oldPassword = '';
  newPassword = '';
  rewritePassword = '';
  currentSessionId = 'sess_def456';

  sessions: SessionEntry[] = [
    { id: 'sess_abc123', ip: '192.168.1.2', device: 'Chrome on Windows' },
    { id: 'sess_def456', ip: '192.168.1.5', device: 'Firefox on Ubuntu' },
    { id: 'sess_xyz789', ip: '10.0.0.23', device: 'Safari on iPhone' },
  ];

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

  openClearWatchHistoryConfirm(): void {
    if (!this.username) return;

    this.confirmClearHistoryModal.open(
      'Are you sure you want to clear your entire watch history? This action cannot be undone.'
    );
  }

  clearWatchHistory(): void {
    if (!this.username) return;

    this.watchedApi.clearUserWatched(this.username).subscribe({
      next: (response) => {
        console.log('Watch history cleared:', response.message);
        alert('Watch history cleared successfully!');
      },
      error: (err) => {
        console.error('Failed to clear watch history:', err);
        alert('Failed to clear watch history. Please try again.');
      },
    });
  }

  submitPasswordChange(): void {
    if (this.newPassword !== this.rewritePassword) {
      alert('New passwords do not match.');
      return;
    }

    if (this.newPassword.length < 8) {
      alert('Password must be at least 8 characters.');
      return;
    }

    // TODO: Replace this with real API call
    console.log('Password change submitted:', {
      username: this.username,
      oldPassword: this.oldPassword,
      newPassword: this.newPassword,
    });

    alert('Password changed successfully (simulated).');

    this.oldPassword = '';
    this.newPassword = '';
    this.rewritePassword = '';
  }

  terminateSession(sessionId: string): void {
    console.log(`Terminating session: ${sessionId}`);
    alert(`Session ${sessionId} terminated (simulated).`);
    this.sessions = this.sessions.filter((s) => s.id !== sessionId);
  }

  terminateAllSessions(): void {
    console.log('Terminating all sessions');
    alert('All sessions terminated (simulated).');
    this.sessions = [];
  }
}
