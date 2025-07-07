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
  VideoFileDisk,
} from '../../../../../../services/ovacli.service';
import { ElectronService } from '../../../../../../services/common-electron.service'; // Re-import ElectronService

@Component({
  selector: 'app-unindexed-video-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './unindexed-video-tab.component.html',
})
export class UnindexedVideoTabComponent implements OnInit, OnChanges {
  @Input() repositoryAddress: string = ''; // Input from parent

  unindexedVideos: VideoFileDisk[] = [];

  searchQuery: string = '';
  unindexedVideoCount: number = 0;
  filteredUnindexedVideos: VideoFileDisk[] = [];
  loading: boolean = false; // Internal loading for this tab
  refreshing: boolean = false; // Internal refreshing for this tab

  constructor(
    private ovacliService: OvacliService,
    private electronService: ElectronService // Re-inject ElectronService
  ) {}

  ngOnInit(): void {
    if (this.repositoryAddress) {
      this.fetchUnindexedVideos(true); // Initial fetch for this tab
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['repositoryAddress'] &&
      changes['repositoryAddress'].currentValue !==
        changes['repositoryAddress'].previousValue
    ) {
      if (this.repositoryAddress) {
        this.fetchUnindexedVideos(true); // Re-fetch if repository address changes
      } else {
        this.unindexedVideos = [];
        this.applyFilterAndCount();
      }
    }
  }

  fetchUnindexedVideos(initialLoad: boolean = false): void {
    if (!this.repositoryAddress) {
      console.warn(
        'Cannot fetch unindexed videos: repositoryAddress is not provided.'
      );
      this.unindexedVideos = [];
      this.applyFilterAndCount();
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
      .runOvacliRepoUnindexed(this.repositoryAddress)
      .then(async (unindexedVideos) => {
        // Make this callback async
        const elapsedTime = Date.now() - startTime;
        const remainingDelay = minDelay - elapsedTime;

        // Join repository path to each unindexed video path
        const processedVideos = await Promise.all(
          unindexedVideos.map(async (video) => {
            const fullPath = await this.electronService.joinPaths(
              this.repositoryAddress,
              video.Path
            );
            return { ...video, Path: fullPath };
          })
        );

        this.unindexedVideos = processedVideos;
        this.sortVideosByPath(this.unindexedVideos);

        if (remainingDelay > 0) {
          setTimeout(() => {
            this.applyFilterAndCount();
            this.loading = false;
            this.refreshing = false;
          }, remainingDelay);
        } else {
          this.applyFilterAndCount();
          this.loading = false;
          this.refreshing = false;
        }
      })
      .catch((err) => {
        console.error('Error fetching unindexed videos:', err);
        const elapsedTime = Date.now() - startTime;
        const remainingDelay = minDelay - elapsedTime;

        if (remainingDelay > 0) {
          setTimeout(() => {
            this.unindexedVideos = [];
            this.applyFilterAndCount();
            this.loading = false;
            this.refreshing = false;
          }, remainingDelay);
        } else {
          this.unindexedVideos = [];
          this.applyFilterAndCount();
          this.loading = false;
          this.refreshing = false;
        }
      });
  }

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

  onSearchQueryChange(): void {
    this.applyFilterAndCount();
  }

  private applyFilterAndCount(): void {
    this.filteredUnindexedVideos = this.unindexedVideos.filter((video) =>
      video.Path.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.unindexedVideoCount = this.filteredUnindexedVideos.length;
  }

  // Updated: Method to open the containing folder and highlight the item
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
