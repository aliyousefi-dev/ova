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
import { OvacliService } from '../../services/ovacli.service'; // Import the OvacliService

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
    adminUsername: 'user', // Default admin username
    adminPassword: 'pass', // Default admin password
  };

  isSaving = false; // Flag to track the saving/loading state
  errorMessage: string = ''; // Error message to show if .ova-repo folder exists
  successMessage: string = ''; // Success message for valid directory

  @ViewChild(ConfirmModalComponent) confirmModal!: ConfirmModalComponent;
  private pendingSave = false;

  passwordFieldType: string = 'password'; // Default password field type

  constructor(
    private electronService: ElectronService,
    private ovacliService: OvacliService // Inject the OvacliService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showModal'] && this.showModal) {
      this.resetConfig();
    }
  }

  // Toggle password visibility
  togglePasswordVisibility() {
    this.passwordFieldType =
      this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  // Handle the directory selection using Electron's folder picker
  selectDirectory() {
    this.electronService
      .pickFolder()
      .then(async (folderPath) => {
        if (folderPath) {
          const ovaRepoPath = await this.electronService.joinPaths(
            folderPath,
            '.ova-repo'
          );
          const exists = await this.electronService.folderExists(ovaRepoPath);
          if (exists) {
            this.showErrorMessage(
              'The selected directory already contains a repository (.ova-repo folder). Please choose another folder.'
            );
            this.config.serverDirectory = '';
          } else {
            this.config.serverDirectory = folderPath;
            this.clearErrorMessage();
          }
        }
      })
      .catch((err) => {
        console.error('Error picking folder:', err);
      });
  }

  showErrorMessage(message: string) {
    this.errorMessage = message;
    this.successMessage = '';
  }

  clearErrorMessage() {
    this.errorMessage = '';
    this.successMessage =
      'Valid directory selected. Proceed to Generate Repository.';
  }

  closeModal() {
    this.resetConfig();
    this.closeSettingsEvent.emit();
  }

  resetConfig() {
    this.config = {
      serverDirectory: '',
      adminUsername: 'user', // Reset to default username
      adminPassword: 'pass', // Reset to default password
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

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

    const folderPath = this.config.serverDirectory;
    const username = this.config.adminUsername;
    const password = this.config.adminPassword;

    // Pass the folder path, username, and password to the OvacliService
    this.ovacliService
      .runOvacliInit(folderPath, username, password) // Include username and password
      .then((result) => {
        if (result.success) {
          console.log('Repository initialized:', result.output);
          this.successMessage = 'Repository initialized successfully!';
        } else {
          console.error('Error initializing repository:', result.error);
          this.errorMessage = `Error: ${result.error}`;
        }
      })
      .catch((error) => {
        console.error('Error initializing repository:', error);
        this.errorMessage = `Error: ${error.message}`;
      });
  }

  onCancelGenerateRepository() {
    this.pendingSave = false;
  }

  saveConfig() {
    if (this.isValidConfig()) {
      this.isSaving = true;

      setTimeout(() => {
        console.log('Server Configuration:', this.config);
        alert('Server configuration saved successfully!');
        this.isSaving = false;
      }, 2000);
    } else {
      alert('Please fill all the required fields correctly.');
    }
  }

  isValidConfig(): boolean {
    return (
      this.config.adminUsername.trim() !== '' &&
      this.config.adminPassword.trim() !== '' &&
      this.config.serverDirectory.trim() !== ''
    );
  }
}
