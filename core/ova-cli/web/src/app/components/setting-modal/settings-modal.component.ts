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
  activeTab: 'theme' | 'profile' = 'theme';

  username = localStorage.getItem('username') || '';
  email = '';

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

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

  onChangePassword() {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      alert('Please fill in all password fields.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      alert('New passwords do not match.');
      return;
    }
    alert('Password change requested (not implemented).');
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  onClose() {
    this.modalRef.nativeElement.close();
    this.close.emit();
  }
}
