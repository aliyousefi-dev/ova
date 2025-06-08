import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar-panel.html',
})
export class SidebarComponent {
  @Input() newRepoPath = '';
  @Input() recentRepos: { name: string; path: string }[] = [];
  @Input() selectedSection: 'home' | 'videos' | 'users' | 'settings' = 'home';

  @Output() setSelectedSection = new EventEmitter<
    'home' | 'videos' | 'users' | 'settings'
  >();

  @Output() newRepoPathChange = new EventEmitter<string>();

  dropdownOpen = false;

  get selectedRepo() {
    return (
      this.recentRepos.find((repo) => repo.path === this.newRepoPath) ||
      this.recentRepos[0]
    );
  }

  selectRepo(repo: { name: string; path: string }) {
    this.newRepoPathChange.emit(repo.path);
    this.dropdownOpen = false;
  }

  onSectionClick(section: 'home' | 'videos' | 'settings' | 'users') {
    this.setSelectedSection.emit(section);
  }
}
