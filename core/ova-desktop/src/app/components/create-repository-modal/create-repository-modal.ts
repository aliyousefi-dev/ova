import {
  Component,
  Output,
  Input,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElectronService } from '../../services/electron.service';

@Component({
  selector: 'app-server-setup-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-repository-modal.html',
})
export class CreateRepositoryModalComponent implements OnChanges {
  @Input() showModal: boolean = false; // Control modal visibility via an input
  @Output() closeSettingsEvent = new EventEmitter<void>();
  activeTab: string = 'setup'; // Default active tab

  config = {
    serverDirectory: '',
    serverHost: '127.0.0.1',
    serverPort: 4040,
  };

  isSaving = false; // Flag to track the saving/loading state

  constructor(private electronService: ElectronService) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Reset config every time modal is opened
    if (changes['showModal'] && this.showModal) {
      this.resetConfig();
    }
  }

  // Handle the directory selection using Electron's folder picker
  selectDirectory() {
    this.electronService
      .pickFolder()
      .then((folderPath) => {
        if (folderPath) {
          this.config.serverDirectory = folderPath; // Update the server directory with the full path
        } else {
          console.log('No folder selected');
        }
      })
      .catch((err) => {
        console.error('Error picking folder:', err);
      });
  }

  // Handle closing the modal
  closeModal() {
    this.resetConfig(); // Reset the config before closing
    this.closeSettingsEvent.emit(); // This will trigger the parent to set showModal to false
  }

  // Reset the config to default values
  resetConfig() {
    this.config = {
      serverDirectory: '',
      serverHost: '127.0.0.1',
      serverPort: 4040,
    };
  }

  // Handle form submission with delay and loading state
  saveConfig() {
    if (this.isValidConfig()) {
      this.isSaving = true; // Start loading state

      // Simulate a delay (e.g., a network request or some background process)
      setTimeout(() => {
        console.log('Server Configuration:', this.config);
        // localStorage.setItem('serverConfig', JSON.stringify(this.config)); // Removed
        alert('Server configuration saved successfully!');
        this.isSaving = false; // End loading state
      }, 2000); // 2-second delay (adjust as needed)
    } else {
      alert('Please fill all the required fields correctly.');
    }
  }

  // Validate configuration
  isValidConfig(): boolean {
    return (
      this.config.serverHost.trim() !== '' &&
      this.config.serverPort > 0 &&
      this.config.serverDirectory.trim() !== ''
    );
  }
}
