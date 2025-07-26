import { Component, OnInit, Input } from '@angular/core'; // Removed Output for logout
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Import Router

import { SettingsModalComponent } from '../../settings/setting-modal/settings-modal.component';
import { UtilsService } from '../../../services/utils.service';
import { AuthApiService } from '../../../services/api/auth-api.service'; // Import AuthApiService

@Component({
  selector: 'app-top-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, SettingsModalComponent],
  templateUrl: './top-navbar.component.html',
})
export class TopNavbarComponent implements OnInit {
  @Input() pageTitle: string = 'Home';

  username: string = 'Guest';

  dropdownOpen = false;

  showSettingsModal = false;

  constructor(
    private utilsService: UtilsService,
    private authapi: AuthApiService, // Inject AuthApiService
    private router: Router // Inject Router
  ) {}

  ngOnInit(): void {
    this.username = this.utilsService.getUsername() || 'Guest';
  }

  get userInitial(): string {
    return this.username ? this.username.charAt(0).toUpperCase() : '?';
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    setTimeout(() => (this.dropdownOpen = false), 150);
  }

  openSettingsModal(): void {
    this.showSettingsModal = true;
    this.dropdownOpen = false;
  }

  closeSettingsModal(): void {
    this.showSettingsModal = false;
    this.username = this.utilsService.getUsername() || 'Guest';
  }

  // Moved the onLogout logic here
  onLogout(): void {
    this.authapi.logout().subscribe({
      next: () => {
        localStorage.removeItem('username'); // Clear username from local storage
        this.username = 'Guest'; // Update the displayed username
        this.router.navigate(['/login']); // Navigate to login page
      },
      error: () => {
        // Handle error, maybe show a message, but still navigate to login
        this.router.navigate(['/login']);
      },
    });
    this.dropdownOpen = false; // Close the dropdown immediately
  }
}
