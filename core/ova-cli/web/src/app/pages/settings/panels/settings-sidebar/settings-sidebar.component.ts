import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './settings-sidebar.component.html',
})
export class SettingsSidebarComponent {
  sidebarOpen = true; // Initial state: sidebar is open

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
