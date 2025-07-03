import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';
import { SidebarComponent } from '../../panels/sidebar-panel/sidebar-panel';
import { HomeSectionComponent } from '../../panels/home-section/home-section.component';
import { SettingsSectionComponent } from '../../panels/settings-section/settings-section.component';
import { UsersSectionComponent } from '../../panels/users-section/users-section.component';
import { VideosSectionComponent } from '../../panels/videos-section/videos-section.component';
import { SettingsModalComponent } from '../../components/settings-modal/settings-modal.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    SidebarComponent,
    HomeSectionComponent,
    SettingsSectionComponent,
    UsersSectionComponent,
    VideosSectionComponent,
    SettingsModalComponent,
  ],
  templateUrl: './home-page.html',
})
export class HomePageComponent {
  cliOutput = '';
  cliError: string | null = null;
  newRepoPath = '';
  selectedSection: 'home' | 'videos' | 'settings' | 'users' = 'home';
  showSettingsModal = false;

  // Imported icons for lucide-icon usage
  eye = Eye;
  eyeOff = EyeOff;

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

  constructor() {
    // Load theme from local storage
    const theme = localStorage.getItem('selectedTheme') || 'light'; // Default to 'light' if not found
    document.documentElement.setAttribute('data-theme', theme);
  }

  serve() {
    console.log('Serving repo:', this.newRepoPath);
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

  openSettings() {
    this.showSettingsModal = true;
    document.documentElement.classList.add('modal-open');
  }

  closeSettings() {
    this.showSettingsModal = false;
    document.documentElement.classList.remove('modal-open');
  }

  appendLog(msg: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.cliOutput += `[${timestamp}] ${msg}\n`;
    // The LogsPanelComponent can handle autoscroll if needed
  }

  setSelectedSection(section: 'home' | 'videos' | 'settings' | 'users') {
    this.selectedSection = section;
  }

  openSettingsFromMenu() {
    this.openSettings();
  }
}
