import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule, FormsModule, NavbarComponent, LucideAngularModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  cliOutput: string = '';
  cliError: string | null = null;
  newRepoPath = '';
  showLogs: boolean = true;
  selectedSection: 'home' | 'videos' | 'settings' | 'users' = 'home';

  // Imported icons for lucide-icon usage
  eye = Eye;
  eyeOff = EyeOff;

  // Initial logs panel height in pixels
  logsHeight = 192;

  // Fake recent repos data for dropdown
  recentRepos = [
    { name: 'Repo Alpha', path: '/Users/alice/projects/repo-alpha' },
    { name: 'Repo Beta', path: '/Users/alice/projects/repo-beta' },
    { name: 'Repo Gamma', path: '/Users/alice/projects/repo-gamma' },
  ];

  // For resizing logs panel
  private resizing = false;
  private startY = 0;
  private startHeight = 0;

  users = [
    { id: 1, name: 'user', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com' },
  ];

  settings = {
    hostname: 'localhost',
    port: 5050,
    customConfig: '',
    enableAuthentication: false,
  };

  constructor() {
    window.electronAPI.onCliLog((msg) => {
      this.cliOutput += msg;
    });

    // Set default repo to first in list
    if (this.recentRepos.length > 0) {
      this.newRepoPath = this.recentRepos[0].path;
    }
  }

  toggleLog() {
    this.showLogs = !this.showLogs;
  }

  async runNewRepo() {
    this.cliOutput = '';
    this.cliError = null;

    if (!this.newRepoPath.trim()) {
      this.cliError = 'Please enter a valid repository path.';
      return;
    }

    try {
      const result = await window.electronAPI.runCli([
        'init',
        this.newRepoPath.trim(),
      ]);

      if (result.success) {
        this.cliOutput += `Repository initialized at ${this.newRepoPath}\n${
          result.output ?? ''
        }`;
      } else {
        this.cliError = result.error ?? 'Unknown error';
      }
    } catch (err) {
      this.cliError = (err as Error).message;
    }
  }

  async chooseFolder() {
    try {
      const folderPath = await window.electronAPI.pickFolder();
      if (folderPath) {
        this.newRepoPath = folderPath;
      }
    } catch (err) {
      this.cliError = 'Failed to select folder: ' + (err as Error).message;
    }
  }

  async serve() {
    this.cliOutput = '';
    this.cliError = null;

    if (!this.newRepoPath.trim()) {
      this.cliError = 'Please enter a valid repository path before serving.';
      return;
    }

    try {
      const result = await window.electronAPI.runCli([
        'serve',
        this.newRepoPath.trim(),
      ]);

      if (!result.success) {
        this.cliError = result.error ?? 'Unknown error';
      }
    } catch (err) {
      this.cliError = (err as Error).message;
    }
  }

  saveSettings() {
    this.cliOutput += `\n[Settings Saved]\nHostname: ${this.settings.hostname}\nPort: ${this.settings.port}\nConfig:\n${this.settings.customConfig}\n`;
  }

  async openInExplorer() {
    if (!this.newRepoPath.trim()) return;
    try {
      await window.electronAPI.openInExplorer(this.newRepoPath.trim());
    } catch (err) {
      this.cliError = 'Failed to open folder: ' + (err as Error).message;
    }
  }

  // Resize logic

  startResize(event: MouseEvent | TouchEvent) {
    event.preventDefault();

    this.resizing = true;
    this.startY = this.getClientY(event);
    this.startHeight = this.logsHeight;

    window.addEventListener('mousemove', this.doResize);
    window.addEventListener('touchmove', this.doResize);
    window.addEventListener('mouseup', this.stopResize);
    window.addEventListener('touchend', this.stopResize);
  }

  private doResize = (event: MouseEvent | TouchEvent) => {
    if (!this.resizing) return;
    const currentY = this.getClientY(event);
    const dy = this.startY - currentY; // drag upward increases height

    const minHeight = 100;
    const maxHeight = window.innerHeight * 0.8;

    let newHeight = this.startHeight + dy;
    newHeight = Math.min(Math.max(newHeight, minHeight), maxHeight);

    this.logsHeight = newHeight;
  };

  private stopResize = () => {
    this.resizing = false;
    window.removeEventListener('mousemove', this.doResize);
    window.removeEventListener('touchmove', this.doResize);
    window.removeEventListener('mouseup', this.stopResize);
    window.removeEventListener('touchend', this.stopResize);
  };

  private getClientY(event: MouseEvent | TouchEvent): number {
    if (event instanceof MouseEvent) return event.clientY;
    return event.touches[0]?.clientY ?? 0;
  }

  copyLogs() {
    if (!this.cliOutput) return;

    navigator.clipboard.writeText(this.cliOutput).then(
      () => {
        // Optional: show a toast or feedback here
        console.log('Logs copied to clipboard');
      },
      (err) => {
        console.error('Failed to copy logs: ', err);
      }
    );
  }
}
