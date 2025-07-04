import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CreateRepositoryModalComponent } from '../../components/create-repository-modal/create-repository-modal';
import { ImportRepositoryModalComponent } from '../../components/import-repository-modal/import-repository-modal';

@Component({
  selector: 'app-repository-home-page',
  templateUrl: './repository-home-page.html',
  imports: [
    CommonModule,
    CreateRepositoryModalComponent,
    ImportRepositoryModalComponent,
  ],
})
export class RepositoryHomePage {
  @ViewChild(CreateRepositoryModalComponent)
  createRepositoryModal!: CreateRepositoryModalComponent;

  @ViewChild(ImportRepositoryModalComponent)
  importRepositoryModal!: ImportRepositoryModalComponent;

  recentServers: any[] = [];
  importedServer: any = null;
  showServerSetupModal: boolean = false;
  showImportRepositoryModal: boolean = false;
  isLoading: boolean = false; // New loading state

  constructor(private router: Router) {
    const fakeRecentServers = [
      { name: 'Tom & Jerry', location: '/path/to/server1' },
      { name: 'Black Server', location: 'localhost:2020' },
      { name: 'Zino Movies', location: '192.168.1.1:4040' },
      { name: 'Server 4', location: 'video.com:8080' },
    ];

    this.recentServers = fakeRecentServers;
    localStorage.setItem('recentServers', JSON.stringify(fakeRecentServers));
  }

  importServer() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ova-repo';

    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file && file.name.endsWith('.ova-repo')) {
        this.isLoading = true; // Start loading state

        const reader = new FileReader();
        reader.onload = () => {
          try {
            const serverData = JSON.parse(reader.result as string);
            this.importedServer = serverData;
          } catch (error) {
            alert('There was an error processing the server file.');
            console.error(error);
          }
          this.isLoading = false; // End loading state
        };
        reader.readAsText(file);
      } else {
        alert('Please select a valid .ova-repo file.');
      }
    };

    input.click();
  }

  addImportedServer() {
    if (this.importedServer) {
      let recentServers = JSON.parse(
        localStorage.getItem('recentServers') || '[]'
      );
      if (
        !recentServers.find(
          (server: any) => server.name === this.importedServer.name
        )
      ) {
        recentServers.push(this.importedServer);
        localStorage.setItem('recentServers', JSON.stringify(recentServers));
        this.recentServers = recentServers;
      }
    }
  }

  setAsDefault(server: any) {
    localStorage.setItem('defaultServer', JSON.stringify(server));
    alert(`Server ${server.name} set as default`);
  }

  openServerSetupModal() {
    this.showServerSetupModal = true; // Open modal
  }

  openImportRepositoryModal() {
    this.showImportRepositoryModal = true;
  }

  closeModal() {
    this.showServerSetupModal = false; // Close modal
  }

  closeImportRepositoryModal() {
    this.showImportRepositoryModal = false;
  }

  connectServer() {
    this.router.navigate(['/login']);
  }
}
