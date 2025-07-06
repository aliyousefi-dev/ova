import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; // Import ActivatedRoute for query params
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule], // Import necessary modules
  selector: 'app-repository-manager',
  templateUrl: 'repository-manager.html',
})
export class RepositoryManagerPage implements OnInit {
  activeTab: string = 'general'; // Default active tab
  loading: boolean = false; // Loading state
  repositoryAddress: string = ''; // Repository address
  videoCount: number = 500; // Example data
  userCount: number = 2; // Example data
  storageUsed: string = '200 GB'; // Example data

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Retrieve repository address from the query params
    this.route.queryParams.subscribe((params) => {
      this.repositoryAddress =
        params['repositoryAddress'] || 'No repository selected'; // Default if no param
    });
  }

  setActiveTab(tab: string) {
    if (this.activeTab === tab) return; // Prevent reloading if same tab is clicked
    this.loading = true;
    this.activeTab = ''; // Temporarily clear the active tab content
    setTimeout(() => {
      this.activeTab = tab;
      this.loading = false;
    }, 300); // Simulate a loading time of 300ms
  }
}
