import { Component } from '@angular/core';
import { SettingsModalComponent } from '../setting-modal/settings-modal.component';

@Component({
  selector: 'app-top-navbar',
  templateUrl: './top-navbar.html',
  styles: [],
  standalone: true, // Add this if this component is standalone
  imports: [SettingsModalComponent], // Import the SettingsModalComponent
})
export class TopNavbar {
  showModal = false;

  openSettingsModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}
