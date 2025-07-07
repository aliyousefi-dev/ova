import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  OvacliService,
  VideoFile,
  VideoFileDisk,
} from '../../../../services/ovacli.service';

@Component({
  selector: 'app-videos-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './videos-tab.component.html',
})
export class VideosTabComponent implements OnInit, OnChanges {
  @Input() repositoryAddress: string = '';

  activeTab: string = 'indexedVideo'; // Default active tab
  indexedVideos: VideoFile[] = [];
  diskVideos: VideoFileDisk[] = []; // New array for videos from disk
  unindexedVideos: VideoFileDisk[] = []; // Now stores VideoFileDisk as they are paths not in repo

  searchQuery: string = '';
  indexedVideoCount: number = 0;
  diskVideoCount: number = 0; // New count for disk videos
  unindexedVideoCount: number = 0;
  loading: boolean = false; // For initial tab load and overall content display
  refreshing: boolean = false; // For refresh button's specific loading state

  constructor(private ovacliService: OvacliService) {}

  ngOnInit() {
    if (this.repositoryAddress) {
      this.fetchVideoLists(true); // Pass true for initial load
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['repositoryAddress'] &&
      changes['repositoryAddress'].currentValue !==
        changes['repositoryAddress'].previousValue
    ) {
      if (this.repositoryAddress) {
        this.fetchVideoLists(true); // Pass true for full load when address changes
      } else {
        this.indexedVideos = [];
        this.diskVideos = [];
        this.unindexedVideos = [];
        this.updateVideoCounts();
      }
    }
  }

  fetchVideoLists(initialLoad: boolean = false) {
    if (!this.repositoryAddress) {
      console.warn(
        'Cannot fetch video lists: repositoryAddress is not provided.'
      );
      this.indexedVideos = [];
      this.diskVideos = [];
      this.unindexedVideos = [];
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

    // Fetch both indexed videos and disk videos concurrently
    Promise.all([
      this.ovacliService.runOvacliVideoList(this.repositoryAddress),
      this.ovacliService.runOvacliRepoVideos(this.repositoryAddress), // Assuming repositoryAddress is also the disk path to scan
    ])
      .then(([indexedVideos, diskVideos]) => {
        const elapsedTime = Date.now() - startTime;
        const remainingDelay = minDelay - elapsedTime;

        if (remainingDelay > 0) {
          setTimeout(() => {
            this.processVideos(indexedVideos, diskVideos);
            this.loading = false;
            this.refreshing = false;
          }, remainingDelay);
        } else {
          this.processVideos(indexedVideos, diskVideos);
          this.loading = false;
          this.refreshing = false;
        }
      })
      .catch((err) => {
        console.error('Error fetching video lists:', err);
        const elapsedTime = Date.now() - startTime;
        const remainingDelay = minDelay - elapsedTime;

        if (remainingDelay > 0) {
          setTimeout(() => {
            this.indexedVideos = [];
            this.diskVideos = [];
            this.unindexedVideos = [];
            this.updateVideoCounts();
            this.loading = false;
            this.refreshing = false;
          }, remainingDelay);
        } else {
          this.indexedVideos = [];
          this.diskVideos = [];
          this.unindexedVideos = [];
          this.updateVideoCounts();
          this.loading = false;
          this.refreshing = false;
        }
      });
  }

  private processVideos(indexed: VideoFile[], disk: VideoFileDisk[]) {
    this.sortVideosByPath(indexed);
    this.sortVideosByPath(disk);

    this.indexedVideos = indexed;
    this.diskVideos = disk;
    this.categorizeVideos();
    this.updateVideoCounts();
  }

  // Helper method to sort the videos by path
  sortVideosByPath<T extends { Path: string }>(videos: T[]): void {
    videos.sort((a, b) => {
      if (a.Path < b.Path) {
        return -1;
      }
      if (a.Path > b.Path) {
        return 1;
      }
      return 0;
    });
  }

  categorizeVideos() {
    const indexedPaths = new Set(this.indexedVideos.map((video) => video.Path));

    // A video is unindexed if it's on disk but its path is not found in the indexed videos
    this.unindexedVideos = this.diskVideos.filter(
      (diskVideo) => !indexedPaths.has(diskVideo.Path)
    );
  }

  // A public method specifically for the refresh button click
  refreshVideos() {
    this.fetchVideoLists();
  }

  filteredIndexedVideos(): VideoFile[] {
    const filtered = this.indexedVideos.filter(
      (video) =>
        video.Path.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        video.ID.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    return filtered;
  }

  filteredDiskVideos(): VideoFileDisk[] {
    const filtered = this.diskVideos.filter((video) =>
      video.Path.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    return filtered;
  }

  filteredUnindexedVideos(): VideoFileDisk[] {
    const filtered = this.unindexedVideos.filter((video) =>
      video.Path.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    return filtered;
  }

  onSearchQueryChange() {
    this.updateVideoCounts();
  }

  private updateVideoCounts() {
    this.indexedVideoCount = this.filteredIndexedVideos().length;
    this.diskVideoCount = this.filteredDiskVideos().length;
    this.unindexedVideoCount = this.filteredUnindexedVideos().length;
  }

  // Method to switch active tabs
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
