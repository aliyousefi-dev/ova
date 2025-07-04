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

  constructor(private electronService: ElectronService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showModal'] && this.showModal) {
      this.resetRepositoryAddress();
    }
  }

  // Handle selecting a repository using Electron's folder picker
  selectRepository() {
    this.electronService
      .pickFolder()
      .then((folderPath) => {
        if (folderPath) {
          this.repositoryAddress = folderPath; // Update the repository address with the selected folder
        } else {
          console.log('No folder selected');
        }
      })
      .catch((err) => {
        console.error('Error picking folder:', err);
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
  }

  // Handle form submission with delay and loading state
  importRepository() {
    if (this.repositoryAddress.trim() !== '') {
      this.isImporting = true; // Start loading state

      // Simulate a delay (e.g., a network request or some background process)
      setTimeout(() => {
        console.log('Importing repository from:', this.repositoryAddress);
        alert('Repository imported successfully!');
        this.isImporting = false; // End loading state
      }, 2000); // 2-second delay (adjust as needed)
    } else {
      alert('Please provide a valid repository address.');
    }
  }
}
