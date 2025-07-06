import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CreateRepositoryModalComponent } from '../../components/create-repository-modal/create-repository-modal';
import { ImportRepositoryModalComponent } from '../../components/import-repository-modal/import-repository-modal';
import {
  IndexedDBService,
  RepositoryData,
} from '../../services/indexeddb-repository.service';

@Component({
  selector: 'app-repository-home-page',
  templateUrl: './repository-home-page.html',
  imports: [
    CommonModule,
    CreateRepositoryModalComponent,
    ImportRepositoryModalComponent,
  ],
})
export class RepositoryHomePage implements OnInit {
  @ViewChild(CreateRepositoryModalComponent)
  createRepositoryModal!: CreateRepositoryModalComponent;

  @ViewChild(ImportRepositoryModalComponent)
  importRepositoryModal!: ImportRepositoryModalComponent;

  recentServers: RepositoryData[] = []; // Updated to use RepositoryData
  importedServer: RepositoryData | null = null; // Ensure importedServer uses RepositoryData
  showServerSetupModal: boolean = false;
  showImportRepositoryModal: boolean = false;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private indexedDBService: IndexedDBService // Inject the IndexedDB service
  ) {}

  ngOnInit() {
    this.loadRecentServers(); // Load recent repositories from IndexedDB on component initialization
  }

  // Load recent repositories from IndexedDB
  loadRecentServers() {
    this.indexedDBService
      .loadRepositoryInfo()
      .then((repositories: RepositoryData[]) => {
        this.recentServers = repositories; // Set the recent servers from IndexedDB
      })
      .catch((error) => {
        console.error('Error loading recent repositories:', error);
      });
  }

  importServer() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ova-repo';

    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file && file.name.endsWith('.ova-repo')) {
        this.isLoading = true;

        const reader = new FileReader();
        reader.onload = () => {
          try {
            const serverData = JSON.parse(reader.result as string);
            this.importedServer = serverData;
          } catch (error) {
            alert('There was an error processing the server file.');
            console.error(error);
          }
          this.isLoading = false;
        };
        reader.readAsText(file);
      } else {
        alert('Please select a valid .ova-repo file.');
      }
    };

    input.click();
  }

  // Add the imported server to IndexedDB
  addImportedServer() {
    if (this.importedServer !== null) {
      // Ensures importedServer is not null
      // Check if the repository is already in IndexedDB
      this.indexedDBService.loadRepositoryInfo().then((repositories) => {
        const exists = repositories.some(
          (repo: RepositoryData) =>
            repo.repositoryAddress === this.importedServer!.repositoryAddress // Ensure non-null assertion on importedServer
        );

        if (!exists) {
          this.indexedDBService
            .saveRepositoryInfo(this.importedServer!) // Save to IndexedDB with non-null assertion
            .then(() => {
              this.loadRecentServers(); // Reload recent servers after adding the new one
            })
            .catch((error) => {
              console.error('Error saving repository to IndexedDB:', error);
            });
        } else {
          alert('This repository is already added.');
        }
      });
    } else {
      console.error('Imported server is null');
    }
  }

  // Method to navigate to the repo-manager page
  goToRepoManager(server: RepositoryData) {
    // Assuming you want to pass the repository address or any relevant info
    this.router.navigate(['/repo-manager'], {
      queryParams: { repositoryAddress: server.repositoryAddress },
    });
  }

  setAsDefault(server: RepositoryData) {
    alert(`Server ${server.name} set as default`);
  }

  openServerSetupModal() {
    this.showServerSetupModal = true;
  }

  openImportRepositoryModal() {
    this.showImportRepositoryModal = true;
  }

  closeModal() {
    this.showServerSetupModal = false;
  }

  closeImportRepositoryModal() {
    this.showImportRepositoryModal = false;
  }

  connectServer() {
    this.router.navigate(['/login']);
  }
}
