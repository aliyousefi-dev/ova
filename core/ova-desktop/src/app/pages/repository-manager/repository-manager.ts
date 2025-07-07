import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Import Router for navigation
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

  constructor(private route: ActivatedRoute, private router: Router) {} // Inject Router for navigation

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.repositoryAddress =
        params['repositoryAddress'] || 'No repository selected';
    });
  }

  // Set active tab and handle loading state
  setActiveTab(tab: string) {
    if (this.activeTab === tab) return; // Prevent reloading if same tab is clicked

    this.loading = true;
    this.activeTab = ''; // Temporarily hide the content
    this.activeTab = tab; // Set the active tab
    this.loading = false; // Hide loading spinner
  }

  // Navigate back to the root or previous page
  goBack() {
    this.router.navigateByUrl('/'); // Navigates to the root ("/") page
  }
}
