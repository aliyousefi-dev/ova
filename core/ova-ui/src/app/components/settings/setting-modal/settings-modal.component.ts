import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  templateUrl: './settings-modal.component.html',
  imports: [CommonModule, FormsModule], // Imports for Angular modules
  styles: [
    `
      .success-message {
        color: green;
        font-weight: bold;
        margin-top: 10px;
      }
    `,
  ],
})
export class SettingsModalComponent implements OnChanges, OnInit {
  @Input() showModal = false;
  @Output() close = new EventEmitter<void>();

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

  selectedTheme = 'light';
  activeTab: 'general' | 'theme' | 'proxy' = 'general'; // Default tab is 'general'

  // Proxy Config properties
  proxyAddress = localStorage.getItem('proxyAddress') || '';
  proxyPort = localStorage.getItem('proxyPort')
    ? parseInt(localStorage.getItem('proxyPort')!, 10)
    : null;
  proxyUser = localStorage.getItem('proxyUser') || '';
  proxyPassword = localStorage.getItem('proxyPassword') || '';

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.selectedTheme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['showModal']) {
      if (this.showModal) {
        // Open the modal if showModal is true
        this.showModal = true;
      } else {
        // Close the modal if showModal is false
        this.showModal = false;
      }
    }
  }

  setActiveTab(tab: 'general' | 'theme' | 'proxy') {
    this.activeTab = tab;
  }

  setTheme(theme: string) {
    this.selectedTheme = theme;
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  saveProxySettings() {
    localStorage.setItem('proxyAddress', this.proxyAddress);
    localStorage.setItem(
      'proxyPort',
      this.proxyPort ? this.proxyPort.toString() : ''
    );
    localStorage.setItem('proxyUser', this.proxyUser);
    localStorage.setItem('proxyPassword', this.proxyPassword);
    console.log('Proxy settings saved:', {
      address: this.proxyAddress,
      port: this.proxyPort,
      user: this.proxyUser,
      password: this.proxyPassword ? '********' : '',
    });
  }

  closeModal(event?: Event) {
    event?.stopPropagation(); // Prevent the event from propagating
    this.showModal = false; // Close the modal
    this.close.emit(); // Emit close event to parent component
  }
}
