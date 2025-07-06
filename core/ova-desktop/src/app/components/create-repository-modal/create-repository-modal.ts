import {
  Component,
  Output,
  Input,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElectronService } from '../../services/common-electron.service';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-create-repository-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
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
  errorMessage: string = ''; // Error message to show if .ova-repo folder exists
  successMessage: string = ''; // Success message for valid directory

  @ViewChild(ConfirmModalComponent) confirmModal!: ConfirmModalComponent;
  private pendingSave = false;

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
      .then(async (folderPath) => {
        if (folderPath) {
          // Check if the .ova-repo folder already exists in the selected directory
          const ovaRepoPath = await this.electronService.joinPaths(
            folderPath,
            '.ova-repo'
          );
          const exists = await this.electronService.folderExists(ovaRepoPath);

          if (exists) {
            // Display error if .ova-repo exists
            this.showErrorMessage(
              'The selected directory already contains a repository (.ova-repo folder). Please choose another folder.'
            );
            this.config.serverDirectory = ''; // Clear the folder path
          } else {
            // Otherwise, set the directory path
            this.config.serverDirectory = folderPath;
            this.clearErrorMessage(); // Clear any previous error messages
          }
        } else {
          console.log('No folder selected');
        }
      })
      .catch((err) => {
        console.error('Error picking folder:', err);
      });
  }

  // Show error message when .ova-repo folder exists
  showErrorMessage(message: string) {
    this.errorMessage = message; // Update error message
    this.successMessage = ''; // Clear success message
  }

  // Clear the error message
  clearErrorMessage() {
    this.errorMessage = ''; // Clear the error message
    this.successMessage =
      'Valid directory selected. Proceed to Generate Repository.'; // Optional success message
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
    this.errorMessage = ''; // Reset any error messages
    this.successMessage = ''; // Reset success message
  }

  // Replace saveConfig button with this handler
  onGenerateRepository() {
    if (this.isValidConfig() && !this.isSaving) {
      this.confirmModal.open(
        'Are you sure you want to generate the repository on this folder?'
      );
      this.pendingSave = true;
    }
  }

  onConfirmGenerateRepository() {
    if (this.pendingSave) {
      this.pendingSave = false;
      this.saveConfig();
    }
  }

  onCancelGenerateRepository() {
    this.pendingSave = false;
  }

  // Handle form submission with delay and loading state
  saveConfig() {
    if (this.isValidConfig()) {
      this.isSaving = true; // Start loading state

      // Simulate a delay (e.g., a network request or some background process)
      setTimeout(() => {
        console.log('Server Configuration:', this.config);
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
