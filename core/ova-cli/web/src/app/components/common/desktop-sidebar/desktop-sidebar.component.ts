import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-desktop-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './desktop-sidebar.component.html',
})
export class DesktopSidebarComponent {
  @Input() title = '';
  @Input() userInitial = '';
  @Output() openSettingsModal = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
}
