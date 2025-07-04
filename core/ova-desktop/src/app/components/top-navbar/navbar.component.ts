import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateRepositoryModalComponent } from '../create-repository-modal/create-repository-modal';
import { AppInfoModalComponent } from '../app-info-modal/app-info-modal.component';
import { ImportRepositoryModalComponent } from '../import-repository-modal/import-repository-modal';
import { ElectronService } from '../../services/common-electron.service';
import { SettingsModalComponent } from '../settings-modal/settings-modal.component'; // Add SettingsModalComponent

@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [
    CommonModule,
    CreateRepositoryModalComponent,
    AppInfoModalComponent,
    ImportRepositoryModalComponent,
    SettingsModalComponent, // Import the SettingsModalComponent
  ],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  openMenu: 'file' | 'view' | 'help' | 'repository' | null = null;
  showServerSetupModal = false;
  showAppInfoModal = false;
  showImportRepositoryModal = false;
  showSettingsModal = false; // Control visibility of settings modal

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

  onImportRepositoryClick() {
    this.showImportRepositoryModal = true;
    this.openMenu = null;
  }

  closeImportRepositoryModal() {
    this.showImportRepositoryModal = false;
  }

  onAboutClick() {
    this.showAppInfoModal = true;
  }

  closeAppInfoModal() {
    this.showAppInfoModal = false;
  }

  // Method to open the Settings Modal
  openSettingsModal() {
    this.showSettingsModal = true;
    this.openMenu = null; // Close the menu when opening the modal
  }

  // Method to close the Settings Modal
  closeSettingsModal() {
    this.showSettingsModal = false;
  }
}
