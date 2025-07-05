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
import { IndexedDBService } from '../../services/indexeddb-repository.service'; // Import IndexedDBService
import { ElectronService } from '../../services/common-electron.service'; // Import ElectronService

@Component({
  selector: 'app-import-repository-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './import-repository-modal.html',
})
export class ImportRepositoryModalComponent implements OnChanges {
  @Input() showModal: boolean = false; // Control modal visibility via an input
  @Output() closeImportRepositoryEvent = new EventEmitter<void>();

  repositoryAddress: string = ''; // To store the repository address (path)
  isImporting: boolean = false; // Flag to track the importing/loading state
  errorMessage: string = ''; // To store error message
  successMessage: string = ''; // To store success message

  constructor(
    private indexedDBService: IndexedDBService, // Inject IndexedDBService
    private electronService: ElectronService // Inject ElectronService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showModal'] && this.showModal) {
      this.resetRepositoryAddress();
      this.loadRepositoryInfo(); // Load saved repository info when the modal is shown
    }
  }

  // Handle selecting a repository using Electron's folder picker
  selectRepository() {
    this.electronService
      .pickFolder()
      .then((folderPath) => {
        if (folderPath) {
          this.repositoryAddress = folderPath; // Update the repository address with the selected folder
          console.log('Folder selected:', folderPath);
          this.checkForOvaRepo(folderPath); // Check for .ova-repo folder
        } else {
          console.log('No folder selected');
        }
      })
      .catch((err) => {
        console.error('Error picking folder:', err);
      });
  }

  // Check if the .ova-repo folder exists in the selected directory
  async checkForOvaRepo(folderPath: string) {
    try {
      // Wait for the paths to be joined
      const ovaRepoPath = await this.electronService.joinPaths(
        folderPath,
        '.ova-repo'
      );

      if (ovaRepoPath) {
        // Now check if the .ova-repo folder exists
        const exists = await this.electronService.folderExists(ovaRepoPath);

        if (exists) {
          this.successMessage =
            'The selected folder contains a valid .ova-repo folder.';
          this.errorMessage = ''; // Reset error message
          this.saveRepositoryInfo(folderPath); // Save the repository address using IndexedDB
        } else {
          this.successMessage = ''; // Clear success message if folder does not exist
          this.errorMessage =
            'The selected folder does not contain a .ova-repo folder.';
        }
      }
    } catch (err) {
      console.error('Error joining paths or checking folder:', err);
      this.successMessage = ''; // Clear success message on error
      this.errorMessage = 'Failed to join paths or check folder.';
    }
  }

  // Save repository information to IndexedDB
  saveRepositoryInfo(folderPath: string) {
    const metadata = { repositoryAddress: folderPath };
    this.indexedDBService
      .saveRepositoryInfo(metadata) // Use IndexedDB service to save the info
      .then(() => {
        console.log('Repository info saved to IndexedDB:', folderPath);
      })
      .catch((err) => {
        console.error('Error saving repository info:', err);
      });
  }

  // Load the saved repository information from IndexedDB
  loadRepositoryInfo() {
    this.indexedDBService
      .loadRepositoryInfo() // Use IndexedDB service to load the info
      .then((data) => {
        console.log('Loaded repository info:', data);
        if (data && data.length > 0) {
          this.repositoryAddress = data[0].repositoryAddress; // Assuming only one entry
          this.checkForOvaRepo(this.repositoryAddress); // Validate loaded repo
        }
      })
      .catch((err) => {
        console.error('Error loading repository info:', err);
      });
  }

  // Close the modal and reset the address
  closeModal() {
    this.resetRepositoryAddress();
    const modal = document.getElementById(
      'import-repository-modal'
    ) as HTMLDialogElement;
    modal.close();
    this.closeImportRepositoryEvent.emit();
  }

  // Reset the repository address to an empty string
  resetRepositoryAddress() {
    this.repositoryAddress = '';
    this.errorMessage = ''; // Clear any error messages
    this.successMessage = ''; // Clear success message
  }

  // Handle form submission with delay and loading state
  importRepository() {
    if (this.repositoryAddress.trim() !== '' && !this.errorMessage) {
      this.isImporting = true; // Start loading state

      // Simulate a delay (e.g., a network request or some background process)
      setTimeout(() => {
        console.log('Importing repository from:', this.repositoryAddress);
        alert('Repository imported successfully!');
        this.isImporting = false; // End loading state
      }, 2000); // 2-second delay (adjust as needed)
    } else {
      alert(
        'Please provide a valid repository address and ensure it contains a .ova-repo folder.'
      );
    }
  }
}
