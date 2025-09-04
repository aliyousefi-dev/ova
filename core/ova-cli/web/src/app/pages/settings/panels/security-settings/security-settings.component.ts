import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './security-settings.component.html',
})
export class SecuritySettingsComponent {
  sidebarOpen = true; // Initial state: sidebar is open

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
