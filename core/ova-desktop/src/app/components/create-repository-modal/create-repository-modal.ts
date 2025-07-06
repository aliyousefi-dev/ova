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
import {
  IndexedDBService,
  RepositoryData,
} from '../../services/indexeddb-repository.service'; // Import IndexedDBService

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

  // config now only holds data relevant to RepositoryData interface
  config: RepositoryData = {
    repositoryAddress: '', // This will be the server directory, initialized empty
    name: '', // Repository name, initialized empty
  };

  // Separate properties for admin username and password, with default values
  adminUsername: string = 'user';
  adminPassword: string = 'pass';

  isSaving = false; // Flag to track the saving/loading state
  errorMessage: string = ''; // Error message to show if .ova-repo folder exists
  successMessage: string = ''; // Success message for valid directory

  @ViewChild(ConfirmModalComponent) confirmModal!: ConfirmModalComponent;
  private pendingSave = false;

  passwordFieldType: string = 'password'; // Default password field type

  constructor(
    private electronService: ElectronService,
    private ovacliService: OvacliService, // Inject the OvacliService
    private indexedDBService: IndexedDBService // Inject the IndexedDBService
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
            this.config.repositoryAddress = ''; // Reset the repository address if folder exists
          } else {
            this.config.repositoryAddress = folderPath;
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
      repositoryAddress: '', // Reset to empty value
      name: '', // Reset the name as well
    };
    this.adminUsername = 'user'; // Reset admin username to default
    this.adminPassword = 'pass'; // Reset admin password to default
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
      this.isSaving = true; // Set saving state to true

      const folderPath = this.config.repositoryAddress;
      const name = this.config.name;

      // Pass the folder path, name, and the component's adminUsername/adminPassword to the OvacliService
      this.ovacliService
        .runOvacliInit(folderPath, this.adminUsername, this.adminPassword)
        .then((result) => {
          if (result.success) {
            console.log('Repository initialized:', result.output);
            this.successMessage = 'Repository initialized successfully!';
            this.saveRepositoryConfig(folderPath, name); // Save to IndexedDB
          } else {
            console.error('Error initializing repository:', result.error);
            this.errorMessage = `Error: ${result.error}`;
          }
        })
        .catch((error) => {
          console.error('Error initializing repository:', error);
          this.errorMessage = `Error: ${error.message}`;
        })
        .finally(() => {
          this.isSaving = false; // Reset saving state
        });
    }
  }

  onCancelGenerateRepository() {
    this.pendingSave = false;
  }

  // Save repository configuration to IndexedDB
  saveRepositoryConfig(folderPath: string, name: string) {
    const metadata: RepositoryData = {
      repositoryAddress: folderPath,
      name: name,
    };

    this.indexedDBService
      .saveRepositoryInfo(metadata) // Use IndexedDB service to save the repository config
      .then(() => {
        console.log('Repository configuration saved to IndexedDB');
        // No need to set successMessage here again, as it's set after ovacliInit
      })
      .catch((err) => {
        console.error('Error saving repository configuration:', err);
        this.errorMessage = `Error saving configuration: ${err.message}`;
      });
  }

  // Load the saved repository configuration from IndexedDB
  loadRepositoryConfig() {
    this.indexedDBService
      .loadRepositoryInfo() // Use IndexedDB service to load the repository info
      .then((data) => {
        console.log('Loaded repository config:', data);
        if (data && data.length > 0) {
          this.config.repositoryAddress = data[0].repositoryAddress;
          this.config.name = data[0].name;
          // Note: adminUsername and adminPassword are not loaded from IndexedDB
          // as they are not part of the RepositoryData interface.
        }
      })
      .catch((err) => {
        console.error('Error loading repository configuration:', err);
      });
  }

  // Checks if the required fields for RepositoryData are filled
  isValidConfig(): boolean {
    return (
      this.config.repositoryAddress.trim() !== '' &&
      this.config.name.trim() !== ''
    );
  }
}
