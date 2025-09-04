import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-appearance-settings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './appearance-settings.component.html',
})
export class AppearanceSettingsComponent {
  selectedTheme = 'light';

  // Remove modalRef usage since we're handling visibility via `showModal`
  themes = [
    'light',
    'dark',
    'mytheme',
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
  ];

  setTheme(theme: string) {
    this.selectedTheme = theme;
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
}
