import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Settings } from 'lucide-angular';
import { SettingsModalComponent } from '../settings-modal/settings-modal.component';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, SettingsModalComponent],
  templateUrl: 'bottom-nav.html',
})
export class BottomNavComponent {
  @Output() settingsClicked = new EventEmitter<void>();

  navbarHeight = 40; // px, matches h-10
  showSettingsModal = false; // Flag to control visibility of the settings modal

  settings = Settings;

  // Open the settings modal
  openSettings() {
    console.log('Open Settings clicked');
    this.showSettingsModal = true; // Open the dialog
  }

  // Close the settings modal
  closeSettings() {
    console.log('Closing Settings');
    this.showSettingsModal = false; // Close the dialog
  }
}
