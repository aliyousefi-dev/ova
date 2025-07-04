import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateRepositoryModalComponent } from '../create-repository-modal/create-repository-modal';
import { ElectronService } from '../../services/electron.service';

@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [CommonModule, CreateRepositoryModalComponent],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  openMenu: 'file' | 'view' | 'help' | 'repository' | null = null;
  showServerSetupModal = false;

  toggleMenu(menu: 'file' | 'view' | 'help' | 'repository') {
    if (this.openMenu === menu) {
      this.openMenu = null;
    } else {
      this.openMenu = menu;
    }
  }

  constructor(private electronService: ElectronService) {
    window.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.menu-button') && !target.closest('.menu-content')) {
        this.openMenu = null;
      }
    });
  }

  minimize() {
    this.electronService.minimizeWindow();
  }

  maximize() {
    this.electronService.maximizeWindow();
  }

  close() {
    this.electronService.closeWindow();
  }

  onNewRepositoryClick() {
    this.openMenu = null;
    this.showServerSetupModal = true;
  }

  closeModal() {
    this.showServerSetupModal = false;
  }
}
