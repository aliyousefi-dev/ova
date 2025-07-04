import { Component, Output, Input, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-modal.component.html',
})
export class SettingsModalComponent {
  @Input() showModal: boolean = false; // Control modal visibility via an input
  @Output() closeSettingsEvent = new EventEmitter<void>();

  activeTab: string = 'theme'; // Default active tab is 'theme'

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

  // Proxy Settings Model
  proxyAddress: string = '';
  proxyPort: number = 8080; // Default proxy port
  proxyUser: string = '';
  proxyPassword: string = '';

  // Close modal and emit event to parent
  closeModal(event: MouseEvent) {
    const modal = document.getElementById(
      'settings_modal'
    ) as HTMLDialogElement;

    if (event.target === event.currentTarget) {
      modal.close();
      this.closeSettingsEvent.emit();
    }
  }

  // Set the active tab
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  // Set the selected theme and save it in localStorage
  setTheme(theme: string) {
    this.selectedTheme = theme;
    localStorage.setItem('selectedTheme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    console.log(`Setting theme to: ${theme}`);
  }

  // Save Proxy Settings
  saveProxySettings() {
    console.log('Saving proxy settings:', {
      address: this.proxyAddress,
      port: this.proxyPort,
      user: this.proxyUser,
      password: this.proxyPassword,
    });
    // Optionally, save these settings to localStorage or make an API call
  }
}
