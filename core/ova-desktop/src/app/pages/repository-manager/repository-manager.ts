import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; // Import ActivatedRoute for query params
import { CommonModule } from '@angular/common';
import { OvacliService, VideoFile } from '../../services/ovacli.service'; // Import OvacliService and VideoFile type
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule], // Import necessary modules
  selector: 'app-repository-manager',
  templateUrl: 'repository-manager.html',
})
export class RepositoryManagerPage implements OnInit {
  activeTab: string = 'general'; // Default active tab
  loading: boolean = false; // Loading state
  repositoryAddress: string = ''; // Repository address
  videoCount: number = 0; // Video count starts at 0
  userCount: number = 2; // Example data
  storageUsed: string = '200 GB'; // Example data
  videos: VideoFile[] = []; // Store videos
  searchQuery: string = ''; // Bind the search query

  constructor(
    private route: ActivatedRoute,
    private ovacliService: OvacliService // Inject OvacliService to fetch video data
  ) {}

  ngOnInit() {
    // Retrieve repository address from the query params
    this.route.queryParams.subscribe((params) => {
      this.repositoryAddress =
        params['repositoryAddress'] || 'No repository selected'; // Default if no param
    });

    // Fetch the video list on initialization
    this.fetchVideoList();
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

  // Method to fetch the video list from OvacliService
  fetchVideoList() {
    if (this.repositoryAddress) {
      this.loading = true;
      this.ovacliService
        .runOvacliVideoList(this.repositoryAddress)
        .then((videos) => {
          this.videos = videos; // Store videos in the component's videos array
          this.updateVideoCount(); // Update the video count based on filtered results
          this.loading = false;
        })
        .catch((err) => {
          console.error('Error fetching video list:', err);
          this.loading = false;
        });
    }
  }

  // Method to filter videos based on the search query
  filteredVideos(): VideoFile[] {
    return this.videos.filter(
      (video) =>
        video.Path.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        video.ID.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // Method to dynamically update video count based on the filtered videos
  updateVideoCount() {
    this.videoCount = this.filteredVideos().length;
  }

  // Method to handle search query changes
  onSearchQueryChange() {
    this.updateVideoCount(); // Update the video count whenever the search query changes
  }
}
