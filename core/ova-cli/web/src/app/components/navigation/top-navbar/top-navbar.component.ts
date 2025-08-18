import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';

import { SettingsModalComponent } from '../../pop-ups/setting-modal/settings-modal.component';
import { UtilsService } from '../../../services/utils.service';
import { AuthApiService } from '../../../services/ova-backend/auth-api.service';

import { MobileDrawerComponent } from '../mobile-drawer/mobile-drawer.component';

@Component({
  selector: 'app-top-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SettingsModalComponent,
    MobileDrawerComponent,
  ],
  templateUrl: './top-navbar.component.html',
})
export class TopNavbarComponent implements OnInit {
  pageTitle: string = 'Home';
  username: string = 'Guest';
  dropdownOpen = false;
  showSettingsModal = false;

  constructor(
    private utilsService: UtilsService,
    private authapi: AuthApiService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.username = this.utilsService.getUsername() || 'Guest';
    // Subscribe to router events to detect route changes
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.getPageTitle();
      }
    });
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

  // Dynamically set page title based on the route
  getPageTitle(): void {
    const currentRoute = this.location.path().split('?')[0]; // Get the route without query parameters
    console.log(currentRoute);

    // Grab the first part of the path to set it as the title
    const pathSegments = currentRoute
      .split('/')
      .filter((segment) => segment.length > 0); // Filter out any empty segments
    const firstPathSegment = pathSegments[0];

    // Capitalize the first letter of the first path segment
    const capitalizedSegment = firstPathSegment
      ? firstPathSegment.charAt(0).toUpperCase() + firstPathSegment.slice(1)
      : 'Home'; // Default to 'Home' if empty

    // Set the title dynamically
    this.pageTitle = capitalizedSegment;
  }

  onLogout(): void {
    this.authapi.logout().subscribe({
      next: () => {
        localStorage.removeItem('username');
        this.username = 'Guest';
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
    this.dropdownOpen = false;
  }
}
