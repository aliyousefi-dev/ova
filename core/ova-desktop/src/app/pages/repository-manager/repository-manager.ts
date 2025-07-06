import { Component, OnInit } from '@angular/core';
import { NgIf, NgClass } from '@angular/common'; // Import NgIf and NgClass

@Component({
  standalone: true,
  imports: [NgIf, NgClass], // Add NgIf and NgClass to imports
  selector: 'selector-name',
  templateUrl: 'repository-manager.html',
})
export class RepositoryManagerPage implements OnInit {
  activeTab: string = 'general'; // Initialize with the default active tab
  loading: boolean = false; // New property to track loading state

  constructor() {}

  ngOnInit() {
    // Optionally, you can trigger an initial load if 'general' tab requires data
    // this.setActiveTab('general');
  }

  setActiveTab(tab: string) {
    if (this.activeTab === tab) {
      return; // Do nothing if the same tab is clicked
    }

    this.loading = true; // Set loading to true immediately
    this.activeTab = ''; // Clear activeTab temporarily to hide current content

    // Simulate a 1-second delay
    setTimeout(() => {
      this.activeTab = tab; // Set the new active tab after the delay
      this.loading = false; // Set loading to false once content is ready
    }, 300); // 1000 milliseconds = 1 second
  }
}
