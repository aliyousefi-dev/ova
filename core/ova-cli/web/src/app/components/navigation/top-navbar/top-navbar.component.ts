import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';

import { SettingsModalComponent } from '../../pop-ups/setting-modal/settings-modal.component';
import { UtilsService } from '../../../services/utils.service';
import { AuthApiService } from '../../../services/api/auth-api.service';

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
    private authapi: AuthApiService,
    private router: Router,
    private location: Location
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

  // // Dynamically set page title based on the route
  // setPageTitle(): void {
  //   const currentRoute = this.location.path().split('?')[0]; // Get the route without query parameters

  //   // Grab the last part of the path to set it as the title
  //   const pathSegment = currentRoute.split('/').pop();

  //   // Set the title dynamically, fall back to 'Home' if empty or unrecognized path
  //   this.pageTitle = pathSegment
  //     ? this.capitalizeFirstLetter(pathSegment)
  //     : 'Home';
  // }

  // // Helper function to capitalize the first letter of a string
  // capitalizeFirstLetter(string: string): string {
  //   return string.charAt(0).toUpperCase() + string.slice(1);
  // }
}
