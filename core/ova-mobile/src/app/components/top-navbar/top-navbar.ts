// top-navbar.ts
import { Component } from '@angular/core';
import { SettingsModalComponent } from '../setting-modal/settings-modal.component';
import { CommonModule } from '@angular/common';
import { SearchbarExpandable } from '../searchbar-expandable/searchbar-expandable';

@Component({
  selector: 'app-top-navbar',
  templateUrl: './top-navbar.html',
  styles: [],
  standalone: true,
  imports: [SettingsModalComponent, CommonModule, SearchbarExpandable], // Add SearchbarExpandable here
})
export class TopNavbar {
  showModal = false;
  isSearchVisible = false; // New property to control the search bar visibility

  openSettingsModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  /**
   * Opens the expandable search bar.
   */
  openSearchBar() {
    this.isSearchVisible = true;
  }

  /**
   * Handles the event emitted when the expandable search bar is closed.
   */
  onSearchClosed() {
    this.isSearchVisible = false;
  }
}
