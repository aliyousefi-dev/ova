import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Import the new tab components
import { GeneralTabComponent } from './components/general-tab/general-tab.component';
import { UsersTabComponent } from './components/users-tab/users-tab.component';
import { VideosTabComponent } from './components/videos-tab/videos-tab.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GeneralTabComponent,
    UsersTabComponent,
    VideosTabComponent,
  ],
  selector: 'app-repository-manager',
  templateUrl: 'repository-manager.html',
})
export class RepositoryManagerPage implements OnInit {
  activeTab: string = 'videos'; // Default active tab
  loading: boolean = false; // Loading state for tab switching transition
  repositoryAddress: string = ''; // Repository address, passed to child tabs

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.repositoryAddress =
        params['repositoryAddress'] || 'No repository selected';
    });
  }

  setActiveTab(tab: string) {
    if (this.activeTab === tab) return; // Prevent reloading if same tab is clicked

    // Remove the artificial delay here
    this.loading = true; // Still show loading briefly if you want a flicker, or remove this line too
    this.activeTab = ''; // Temporarily hide the content
    // The content will reappear on the next tick once activeTab is set
    this.activeTab = tab;
    this.loading = false; // Hide loading spinner immediately
  }
}
