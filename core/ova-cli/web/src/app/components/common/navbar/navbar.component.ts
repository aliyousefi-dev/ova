import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { SettingsModalComponent } from '../../settings/setting-modal/settings-modal.component';
import { AuthApiService } from '../../../services/api/auth-api.service';
import { DesktopSidebarComponent } from '../desktop-sidebar/desktop-sidebar.component';
import { MobileDockComponent } from '../mobile-dock/mobile-dock.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SettingsModalComponent,
    DesktopSidebarComponent,
    MobileDockComponent,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavBarComponent implements OnInit {
  @Input() title = ''; // sidebar title

  username = '';
  isSettingsModalOpen = false;
  dropdownOpen = false;

  // This will hold the dynamic page title like 'Discover', 'Library', etc.
  pageTitle: string = '';

  constructor(private authapi: AuthApiService, private router: Router) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || 'Guest';

    // Listen for route changes to update pageTitle
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = (event as NavigationEnd).urlAfterRedirects;
        this.pageTitle = this.getPageTitleFromUrl(url);
      });
  }

  getPageTitleFromUrl(url: string): string {
    if (url.startsWith('/discover')) return 'Discover';
    if (url.startsWith('/library')) return 'Library';
    if (url.startsWith('/saved')) return 'Saved';
    if (url.startsWith('/playlists')) return 'Playlists';
    if (url.startsWith('/profile')) return 'Profile';
    if (url.startsWith('/dashboard')) return 'Dashboard';
    if (url.startsWith('/watch')) return 'Watch';
    if (url === '/' || url === '') return 'Home';
    return ''; // fallback blank if unknown
  }

  get userInitial(): string {
    return this.username ? this.username.charAt(0).toUpperCase() : '?';
  }

  openSettingsModal(): void {
    this.isSettingsModalOpen = true;
    this.dropdownOpen = false; // close dropdown if open
  }

  closeSettingsModal(): void {
    this.isSettingsModalOpen = false;
    this.username = localStorage.getItem('username') || 'Guest';
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    setTimeout(() => (this.dropdownOpen = false), 150);
  }

  onLogout(): void {
    this.authapi.logout().subscribe({
      next: () => {
        localStorage.removeItem('username');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
    this.dropdownOpen = false;
  }
}
