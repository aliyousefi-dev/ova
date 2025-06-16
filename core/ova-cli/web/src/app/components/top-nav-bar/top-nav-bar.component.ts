import { Component, Input, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthApiService } from '../../services/api/auth-api.service';
import { SettingsModalComponent } from '../setting-modal/settings-modal.component';

@Component({
  selector: 'app-top-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterModule, SettingsModalComponent], // Add SettingsModalComponent here
  templateUrl: './top-nav-bar.component.html',
  styleUrls: ['./top-nav-bar.component.css'],
})
export class TopNavBarComponent implements OnInit {
  @Input() title = '';

  SavedCount = 10;
  username = '';
  isSettingsModalOpen = false; // New property to control modal visibility

  constructor(private authapi: AuthApiService, private router: Router) {}

  ngOnInit() {
    this.username = localStorage.getItem('username') || 'Guest';
  }

  onLogout() {
    this.authapi.logout().subscribe({
      next: () => {
        localStorage.removeItem('username');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }

  get userInitial(): string {
    return this.username ? this.username.charAt(0).toUpperCase() : '?';
  }

  // New methods for modal control
  openSettingsModal() {
    this.isSettingsModalOpen = true;
  }

  closeSettingsModal() {
    this.isSettingsModalOpen = false;
    // Optionally, update the username displayed in the top bar if it was changed in the modal
    this.username = localStorage.getItem('username') || 'Guest';
  }
}
