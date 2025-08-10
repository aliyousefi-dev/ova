import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-desktop-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './desktop-sidebar.component.html',
  styleUrls: ['./desktop-sidebar.component.css'],
})
export class DesktopSidebarComponent {
  sidebarOpen = true; // Initial state: sidebar is open

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
