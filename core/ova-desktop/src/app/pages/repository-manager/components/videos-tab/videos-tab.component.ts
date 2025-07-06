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

  videos: VideoFile[] = [];

  searchQuery: string = '';
  videoCount: number = 0;
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
        this.updateVideoCount();
      }
    }
  }

  // Method to fetch the video list from OvacliService
  // Accepts an optional boolean `initialLoad` to differentiate between full tab load and button refresh
  fetchVideoList(initialLoad: boolean = false) {
    if (!this.repositoryAddress) {
      console.warn(
        'Cannot fetch video list: repositoryAddress is not provided.'
      );
      this.videos = [];
      this.updateVideoCount();
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
            this.videos = videos;
            this.updateVideoCount();
            this.loading = false;
            this.refreshing = false;
          }, remainingDelay);
        } else {
          this.videos = videos;
          this.updateVideoCount();
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
            this.updateVideoCount();
            this.loading = false;
            this.refreshing = false;
          }, remainingDelay);
        } else {
          this.videos = []; // Clear videos on error
          this.updateVideoCount();
          this.loading = false;
          this.refreshing = false;
        }
      });
  }

  // A public method specifically for the refresh button click
  refreshVideos() {
    this.fetchVideoList();
  }

  filteredVideos(): VideoFile[] {
    const filtered = this.videos.filter(
      (video) =>
        video.Path.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        video.ID.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    return filtered;
  }

  onSearchQueryChange() {
    this.updateVideoCount();
  }

  private updateVideoCount() {
    this.videoCount = this.filteredVideos().length;
  }
}
