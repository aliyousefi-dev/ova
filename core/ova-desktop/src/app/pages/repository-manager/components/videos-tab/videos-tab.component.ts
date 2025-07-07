import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OvacliService, VideoFile } from '../../../../services/ovacli.service';

@Component({
  selector: 'app-videos-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './videos-tab.component.html',
})
export class VideosTabComponent implements OnInit, OnChanges {
  @Input() repositoryAddress: string = '';

  activeTab: string = 'indexedVideo'; // Default active tab
  videos: VideoFile[] = [];
  indexedVideos: VideoFile[] = [];
  unindexedVideos: VideoFile[] = [];

  searchQuery: string = '';
  indexedVideoCount: number = 0;
  unindexedVideoCount: number = 0;
  loading: boolean = false; // For initial tab load and overall content display
  refreshing: boolean = false; // For refresh button's specific loading state

  constructor(private ovacliService: OvacliService) {}

  ngOnInit() {
    if (this.repositoryAddress) {
      this.fetchVideoList(true); // Pass true for initial load
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['repositoryAddress'] &&
      changes['repositoryAddress'].currentValue !==
        changes['repositoryAddress'].previousValue
    ) {
      if (this.repositoryAddress) {
        this.fetchVideoList(true); // Pass true for full load when address changes
      } else {
        this.videos = [];
        this.indexedVideos = [];
        this.unindexedVideos = [];
        this.updateVideoCounts();
      }
    }
  }

  fetchVideoList(initialLoad: boolean = false) {
    if (!this.repositoryAddress) {
      console.warn(
        'Cannot fetch video list: repositoryAddress is not provided.'
      );
      this.videos = [];
      this.updateVideoCounts();
      return;
    }

    if (initialLoad) {
      this.loading = true; // Show full tab spinner for initial load/address change
    } else {
      this.refreshing = true; // Show button spinner for manual refresh
    }

    const minDelay = 500; // Minimum delay in milliseconds (e.g., 0.5 seconds)
    const startTime = Date.now();

    this.ovacliService
      .runOvacliVideoList(this.repositoryAddress)
      .then((videos) => {
        const elapsedTime = Date.now() - startTime;
        const remainingDelay = minDelay - elapsedTime;

        if (remainingDelay > 0) {
          setTimeout(() => {
            this.sortVideosByAddress(videos); // Sort videos by video address
            this.categorizeVideos(videos);
            this.updateVideoCounts();
            this.loading = false;
            this.refreshing = false;
          }, remainingDelay);
        } else {
          this.sortVideosByAddress(videos); // Sort videos by video address
          this.categorizeVideos(videos);
          this.updateVideoCounts();
          this.loading = false;
          this.refreshing = false;
        }
      })
      .catch((err) => {
        console.error('Error fetching video list:', err);
        const elapsedTime = Date.now() - startTime;
        const remainingDelay = minDelay - elapsedTime;

        if (remainingDelay > 0) {
          setTimeout(() => {
            this.videos = []; // Clear videos on error
            this.updateVideoCounts();
            this.loading = false;
            this.refreshing = false;
          }, remainingDelay);
        } else {
          this.videos = []; // Clear videos on error
          this.updateVideoCounts();
          this.loading = false;
          this.refreshing = false;
        }
      });
  }

  // Helper method to sort the videos by address (Path)
  sortVideosByAddress(videos: any[]): void {
    videos.sort((a, b) => {
      if (a.Path < b.Path) {
        return -1; // a comes first
      }
      if (a.Path > b.Path) {
        return 1; // b comes first
      }
      return 0; // Equal (no sorting)
    });
  }

  categorizeVideos(videos: VideoFile[]) {
    this.indexedVideos = videos.filter((video) => video.ID && video.Path); // Example of indexed videos
    this.unindexedVideos = videos.filter((video) => !video.ID || !video.Path); // Example of unindexed videos
  }

  // A public method specifically for the refresh button click
  refreshVideos() {
    this.fetchVideoList();
  }

  filteredIndexedVideos(): VideoFile[] {
    const filtered = this.indexedVideos.filter(
      (video) =>
        video.Path.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        video.ID.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    return filtered;
  }

  filteredUnindexedVideos(): VideoFile[] {
    const filtered = this.unindexedVideos.filter(
      (video) =>
        video.Path.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        video.ID.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    return filtered;
  }

  onSearchQueryChange() {
    this.updateVideoCounts();
  }

  private updateVideoCounts() {
    this.indexedVideoCount = this.filteredIndexedVideos().length;
    this.unindexedVideoCount = this.filteredUnindexedVideos().length;
  }

  // Method to switch active tabs
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
