import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElectronService } from '../../services/common-electron.service'; // Ensure you have the Electron service

@Component({
  selector: 'app-app-info-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-info-modal.component.html',
})
export class AppInfoModalComponent {
  @Input() showModal: boolean = false; // Control modal visibility via an input
  @Output() closeAppInfoEvent = new EventEmitter<void>();

  appVersion: string = '1.0.0'; // Set your app's version here
  appName: string = 'Online Video Archive (OVA)'; // Set your app's name here

  electronVersion: string = ''; // To store Electron version
  nodeVersion: string = ''; // To store Node.js version
  angularVersion: string = ''; // To store Angular version

  constructor(private electronService: ElectronService) {
    // Fetch versions dynamically
    this.electronVersion = '1.0.0'; // Call to Electron Service to get version
    this.nodeVersion = '1.0.0'; // Node.js version from process
    this.angularVersion = '1.0.0'; // Get Angular version (from package.json or hardcoded)
  }

  // Close the modal
  closeModal() {
    const modal = document.getElementById(
      'app-info-modal'
    ) as HTMLDialogElement;
    modal.close();
    this.closeAppInfoEvent.emit();
  }
}
