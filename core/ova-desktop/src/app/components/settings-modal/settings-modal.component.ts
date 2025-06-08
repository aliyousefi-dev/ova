import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-modal.component.html',
})
export class SettingsModalComponent {
  @Output() closeSettingsEvent = new EventEmitter<void>();
  activeTab: string = 'theme';

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
  ];
  selectedTheme: string = localStorage.getItem('selectedTheme') || 'light';

  closeModal() {
    const modal = document.getElementById(
      'settings_modal'
    ) as HTMLDialogElement;
    modal.close();
    this.closeSettingsEvent.emit();
  }

  setTheme(theme: string) {
    this.selectedTheme = theme;
    localStorage.setItem('selectedTheme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    console.log(`Setting theme to: ${theme}`);
  }
}
