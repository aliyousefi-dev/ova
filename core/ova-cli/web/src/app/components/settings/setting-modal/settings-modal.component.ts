import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeCardComponent } from '../theme-card/theme-card.component';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  templateUrl: './settings-modal.component.html',
  imports: [CommonModule, FormsModule, ThemeCardComponent],
  styles: [``],
})
export class SettingsModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  @ViewChild('modal') modalRef!: ElementRef<HTMLDialogElement>;

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
  activeTab: 'theme' | 'backend' = 'theme';

  // Backend Config
  apiBaseUrl = localStorage.getItem('apiBaseUrl') || '/api/v1';

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.selectedTheme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && this.modalRef) {
      if (this.isOpen) {
        this.modalRef.nativeElement.showModal();
      } else {
        this.modalRef.nativeElement.close();
      }
    }
  }

  setActiveTab(tab: 'theme' | 'backend') {
    this.activeTab = tab;
  }

  selectTheme(theme: string) {
    this.selectedTheme = theme;
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  onSaveBackendConfig() {
    localStorage.setItem('apiBaseUrl', this.apiBaseUrl);
    alert('API base URL saved!');
  }

  onClose() {
    this.modalRef.nativeElement.close();
    this.close.emit();
  }
}
