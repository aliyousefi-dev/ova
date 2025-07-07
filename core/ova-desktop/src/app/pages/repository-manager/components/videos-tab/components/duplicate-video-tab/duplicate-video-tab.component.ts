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
  VideoFileDuplicate, // Import the updated interface
} from '../../../../../../services/ovacli.service';
import { ElectronService } from '../../../../../../services/common-electron.service';

@Component({
  selector: 'app-duplicate-video-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './duplicate-video-tab.component.html',
})
export class DuplicateVideoTabComponent implements OnInit, OnChanges {
  @Input() repositoryAddress: string = ''; // Input from parent

  duplicateVideos: VideoFileDuplicate[] = []; // Use VideoFileDuplicate instead of DuplicateVideo
  searchQuery: string = '';
  duplicateVideoCount: number = 0;
  filteredDuplicateVideos: VideoFileDuplicate[] = [];
  loading: boolean = false; // Internal loading for this tab
  refreshing: boolean = false; // Internal refreshing for this tab

  private isFetching: boolean = false; // Track if fetch is in progress
  private debounceTimer: any; // Timer for debouncing

  constructor(
    private ovacliService: OvacliService,
    private electronService: ElectronService
  ) {}

  ngOnInit(): void {
    if (this.repositoryAddress) {
      this.fetchDuplicateVideos(true); // Initial fetch for this tab
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['repositoryAddress']) {
      clearTimeout(this.debounceTimer); // Clear previous debounce timer
      this.debounceTimer = setTimeout(() => {
        if (this.repositoryAddress) {
          this.fetchDuplicateVideos(true); // Re-fetch if repository address changes
        } else {
          this.duplicateVideos = [];
          this.applyFilterAndCount();
        }
      }, 500); // 500 ms debounce time to avoid rapid re-fetches
    }
  }

  fetchDuplicateVideos(initialLoad: boolean = false): void {
    if (this.isFetching) {
      console.log('Already fetching duplicate videos, skipping this call.');
      return; // Skip if already fetching
    }

    this.isFetching = true; // Set fetching flag to true

    if (!this.repositoryAddress) {
      console.warn(
        'Cannot fetch duplicate videos: repositoryAddress is not provided.'
      );
      this.duplicateVideos = [];
      this.applyFilterAndCount();
      this.isFetching = false;
      return;
    }

    if (initialLoad) {
      this.loading = true;
    } else {
      this.refreshing = true;
    }

    const minDelay = 0;
    const startTime = Date.now();

    this.ovacliService
      .runOvacliRepoDuplicates(this.repositoryAddress)
      .then(async (duplicates: VideoFileDuplicate[]) => {
        // Directly use the paths without joining them
        const processedDuplicates = duplicates.map((duplicate) => {
          return { ...duplicate, paths: duplicate.paths }; // Just retain the paths as they are
        });

        this.duplicateVideos = processedDuplicates;
        this.sortDuplicatesByHash(this.duplicateVideos); // Sort by hash

        const elapsedTime = Date.now() - startTime;
        const remainingDelay = minDelay - elapsedTime;

        if (remainingDelay > 0) {
          setTimeout(() => {
            this.applyFilterAndCount();
            this.loading = false;
            this.refreshing = false;
            this.isFetching = false; // Reset fetching flag
          }, remainingDelay);
        } else {
          this.applyFilterAndCount();
          this.loading = false;
          this.refreshing = false;
          this.isFetching = false; // Reset fetching flag
        }
      })
      .catch((err) => {
        console.error('Error fetching duplicate videos:', err);
        const elapsedTime = Date.now() - startTime;
        const remainingDelay = minDelay - elapsedTime;

        if (remainingDelay > 0) {
          setTimeout(() => {
            this.duplicateVideos = [];
            this.applyFilterAndCount();
            this.loading = false;
            this.refreshing = false;
            this.isFetching = false; // Reset fetching flag
          }, remainingDelay);
        } else {
          this.duplicateVideos = [];
          this.applyFilterAndCount();
          this.loading = false;
          this.refreshing = false;
          this.isFetching = false; // Reset fetching flag
        }
      });
  }

  sortDuplicatesByHash<T extends { hash: string }>(duplicates: T[]): void {
    duplicates.sort((a, b) => {
      if (a.hash < b.hash) {
        return -1;
      }
      if (a.hash > b.hash) {
        return 1;
      }
      return 0;
    });
  }

  onSearchQueryChange(): void {
    this.applyFilterAndCount();
  }

  private applyFilterAndCount(): void {
    this.filteredDuplicateVideos = this.duplicateVideos.filter(
      (duplicate) =>
        duplicate.paths.some((path) =>
          path.toLowerCase().includes(this.searchQuery.toLowerCase())
        ) ||
        duplicate.hash.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.duplicateVideoCount = this.filteredDuplicateVideos.length;
  }

  async openContainingFolder(fullVideoPath: string): Promise<void> {
    console.log('Attempting to show item in folder for:', fullVideoPath);
    try {
      const success = await this.electronService.showItemInFolder(
        fullVideoPath
      );
      if (success) {
        console.log('Item shown in folder successfully:', fullVideoPath);
      } else {
        console.error('Failed to show item in folder for:', fullVideoPath);
        // Optionally, show a user-friendly message
      }
    } catch (error) {
      console.error('Error in openContainingFolder:', error);
      // Optionally, show a user-friendly message
    }
  }
}
