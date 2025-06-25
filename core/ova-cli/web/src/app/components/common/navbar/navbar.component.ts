import { Component, Input, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthApiService } from '../../../services/api/auth-api.service';
import { SettingsModalComponent } from '../../settings/setting-modal/settings-modal.component';

import {
  LucideAngularModule,
  Settings, // Gear icon for settings button
  Search, // Search icon
  BookOpen, // Library icon (closest)
  Bookmark, // Saved icon
  List, // Playlists icon (closest)
} from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SettingsModalComponent,
    LucideAngularModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavBarComponent implements OnInit {
  @Input() title = '';

  username = '';
  isSettingsModalOpen = false;

  // Expose lucide icons here:
  readonly Settings = Settings;
  readonly Search = Search;
  readonly BookOpen = BookOpen;
  readonly Bookmark = Bookmark;
  readonly List = List;

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

  openSettingsModal() {
    this.isSettingsModalOpen = true;
  }

  closeSettingsModal() {
    this.isSettingsModalOpen = false;
    this.username = localStorage.getItem('username') || 'Guest';
  }
}
