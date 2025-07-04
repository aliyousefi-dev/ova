import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  openMenu: 'file' | 'view' | 'help' | 'repository' | null = null;

  @Output() newRepositoryClicked = new EventEmitter<void>();

  toggleMenu(menu: 'file' | 'view' | 'help' | 'repository') {
    if (this.openMenu === menu) {
      this.openMenu = null;
    } else {
      this.openMenu = menu;
    }
  }

  constructor() {
    window.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.menu-button') && !target.closest('.menu-content')) {
        this.openMenu = null;
      }
    });
  }

  minimize() {
    window.electronAPI.windowControl('minimize');
  }

  maximize() {
    window.electronAPI.windowControl('maximize');
  }

  close() {
    window.electronAPI.windowControl('close');
  }

  onNewRepositoryClick() {
    this.newRepositoryClicked.emit();
    this.openMenu = null; // Optionally close the menu after click
  }
}
