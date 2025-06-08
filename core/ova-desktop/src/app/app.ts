import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';
import { LogsPanelComponent } from './logs-panel/logs-panel';
import { BottomNavComponent } from './bottom-nav/bottom-nav';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    LucideAngularModule,
    BottomNavComponent,
    LogsPanelComponent,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  cliOutput = '';
  cliError: string | null = null;
  newRepoPath = '';
  showLogs = true;
  selectedSection: 'home' | 'videos' | 'settings' | 'users' = 'home';

  // Imported icons for lucide-icon usage
  eye = Eye;
  eyeOff = EyeOff;

  // Logs panel height in pixels
  logsHeight = 192;

  // Fake recent repos data for dropdown
  recentRepos = [
    { name: 'Repo Alpha', path: '/Users/alice/projects/repo-alpha' },
    { name: 'Repo Beta', path: '/Users/alice/projects/repo-beta' },
    { name: 'Repo Gamma', path: '/Users/alice/projects/repo-gamma' },
  ];

  // Fake users list
  users = [
    { id: 1, name: 'user', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com' },
  ];

  settings = {
    hostname: 'localhost',
    port: 5050,
  };

  logPanelHeight = 100; // Initial height in pixels
  resizing = false;

  startResize(event: MouseEvent) {
    this.resizing = true;
    event.preventDefault();
  }

  onMouseMove(event: MouseEvent) {
    if (!this.resizing) return;

    // Calculate height from bottom of screen
    const windowHeight = window.innerHeight;
    this.logPanelHeight = windowHeight - event.clientY;

    // Optional: Set min/max height
    if (this.logPanelHeight < 50) this.logPanelHeight = 50;
    if (this.logPanelHeight > windowHeight - 100)
      this.logPanelHeight = windowHeight - 100;
  }

  stopResize() {
    this.resizing = false;
  }

  constructor() {}

  serve() {
    this.appendLog('Serving repository at path: ' + this.newRepoPath);
    // Implement serve logic here
  }

  runNewRepo() {
    this.appendLog('Creating new repo at path: ' + this.newRepoPath);
    // Implement new repo logic here
  }

  chooseFolder() {
    this.appendLog('Opening folder chooser...');
    // Implement folder chooser logic here
  }

  saveSettings() {
    this.appendLog(`Saving settings: ${JSON.stringify(this.settings)}`);
    // Implement settings persistence here
  }

  toggleLog() {
    this.showLogs = !this.showLogs;
  }

  appendLog(msg: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.cliOutput += `[${timestamp}] ${msg}\n`;
    // The LogsPanelComponent can handle autoscroll if needed
  }
}
