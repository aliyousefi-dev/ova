import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Minimize,
  Maximize2,
  Square,
  X,
  Minus,
} from 'lucide-angular';

@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  Minimize = Minimize;
  Maximize2 = Maximize2;
  Minus = Minus;
  Square = Square;
  X = X;

  openMenu: 'file' | 'view' | 'help' | 'repository' | null = null;

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
}
