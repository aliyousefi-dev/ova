import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-server-setup',
  templateUrl: './server-setup.page.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ServerSetupPage {
  config = {
    serverDirectory: '',
    serverHost: '127.0.0.1',
    serverPort: 4040,
  };

  constructor(private router: Router) {}

  // Handle the directory selection
  selectDirectory() {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true; // Enable directory selection
    input.accept = '*/*'; // Allow any file type (this is just for the directory picker)

    input.onchange = (event: any) => {
      const directoryPath =
        event.target.files[0].webkitRelativePath.split('/')[0]; // Get the directory path
      this.config.serverDirectory = directoryPath;
    };

    input.click(); // Trigger the file input dialog
  }

  // Back button navigation to the root
  goBack() {
    this.router.navigate(['/']);
  }

  saveConfig() {
    if (this.isValidConfig()) {
      console.log('Server Configuration:', this.config);
      localStorage.setItem('serverConfig', JSON.stringify(this.config));
      alert('Server configuration saved successfully!');
      this.router.navigate(['/server-status']);
    } else {
      alert('Please fill all the required fields correctly.');
    }
  }

  isValidConfig(): boolean {
    return (
      this.config.serverHost.trim() !== '' &&
      this.config.serverPort > 0 &&
      this.config.serverDirectory.trim() !== ''
    );
  }
}
