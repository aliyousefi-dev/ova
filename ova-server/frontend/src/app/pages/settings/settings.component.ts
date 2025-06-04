import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { TopNavBarComponent } from '../../components/top-nav-bar/top-nav-bar.component';
import { ThemeCardComponent } from '../../components/theme-card/theme-card.component'; // updated import
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TopNavBarComponent,
    ThemeCardComponent, // updated here
  ],
  templateUrl: './settings.component.html',
  styles: [``],
})
export class SettingsComponent implements OnInit {
  themes = [
    'light',
    'dark',
    'cupcake',
    'bumblebee',
    'emerald',
    'corporate',
    'synthwave',
    'retro',
    'cyberpunk',
    'valentine',
    'halloween',
    'garden',
    'forest',
    'aqua',
    'lofi',
    'pastel',
    'fantasy',
    'wireframe',
    'black',
    'luxury',
    'dracula',
    'cmyk',
    'autumn',
    'business',
    'acid',
    'lemonade',
    'night',
    'coffee',
    'winter',
    'dim',
    'nord',
    'sunset',
    'caramellatte',
    'abyss',
    'silk',
  ];

  selectedTheme = 'light';

  username = '';
  email = '';

  activeTab: 'theme' | 'profile' = 'theme';

  constructor(private authapi: AuthApiService, private router: Router) {}

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.selectedTheme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);

    this.username = localStorage.getItem('username') || '';
    this.email = ''; // TODO: load actual email from API or local storage if available
  }

  setActiveTab(tab: 'theme' | 'profile') {
    this.activeTab = tab;
  }

  selectTheme(theme: string) {
    this.selectedTheme = theme;
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  onSaveProfile() {
    localStorage.setItem('username', this.username);
    alert('Profile saved!');
  }

  onLogout() {
    this.authapi.logout().subscribe({
      next: () => {
        localStorage.clear();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }
}
