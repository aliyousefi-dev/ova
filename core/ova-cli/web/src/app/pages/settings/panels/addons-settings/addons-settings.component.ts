import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-addons-settings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './addons-settings.component.html',
})
export class AddonsSettingsComponent {
  sidebarOpen = true; // Initial state: sidebar is open

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
