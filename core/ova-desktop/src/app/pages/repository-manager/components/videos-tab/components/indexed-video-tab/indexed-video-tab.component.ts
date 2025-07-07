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
} from '../../../../../../services/ovacli.service';
import { ElectronService } from '../../../../../../services/common-electron.service';

@Component({
  selector: 'app-indexed-video-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './indexed-video-tab.component.html',
})
export class IndexedVideoTabComponent implements OnInit, OnChanges {
  @Input() repositoryAddress: string = ''; // Input from parent

  indexedVideos: VideoFile[] = [];
  searchQuery: string = '';
  indexedVideoCount: number = 0;
  filteredIndexedVideos: VideoFile[] = [];
  loading: boolean = false; // Internal loading for this tab
  refreshing: boolean = false; // Internal refreshing for this tab

  constructor(
    private ovacliService: OvacliService,
    private electronService: ElectronService
  ) {}

  ngOnInit(): void {
    if (this.repositoryAddress) {
      this.fetchIndexedVideos(true); // Initial fetch for this tab
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['repositoryAddress'] &&
      changes['repositoryAddress'].currentValue !==
        changes['repositoryAddress'].previousValue
    ) {
      if (this.repositoryAddress) {
        this.fetchIndexedVideos(true); // Re-fetch if repository address changes
      } else {
        this.indexedVideos = [];
        this.applyFilterAndCount();
      }
    }
  }

  fetchIndexedVideos(initialLoad: boolean = false): void {
    if (!this.repositoryAddress) {
      console.warn(
        'Cannot fetch indexed videos: repositoryAddress is not provided.'
      );
      this.indexedVideos = [];
      this.applyFilterAndCount();
      return;
    }

    if (initialLoad) {
      this.loading = true;
    } else {
      this.refreshing = true;
    }

    const minDelay = 500;
    const startTime = Date.now();

    this.ovacliService
      .runOvacliVideoList(this.repositoryAddress)
      .then(async (indexedVideosRaw) => {
        const elapsedTime = Date.now() - startTime;
        const remainingDelay = minDelay - elapsedTime;

        const processedIndexedVideos = await this.processIndexedVideoPaths(
          this.repositoryAddress,
          indexedVideosRaw
        );

        if (remainingDelay > 0) {
          setTimeout(() => {
            this.indexedVideos = processedIndexedVideos;
            this.sortVideosByPath(this.indexedVideos);
            this.applyFilterAndCount();
            this.loading = false;
            this.refreshing = false;
          }, remainingDelay);
        } else {
          this.indexedVideos = processedIndexedVideos;
          this.sortVideosByPath(this.indexedVideos);
          this.applyFilterAndCount();
          this.loading = false;
          this.refreshing = false;
        }
      })
      .catch((err) => {
        console.error('Error fetching indexed videos:', err);
        const elapsedTime = Date.now() - startTime;
        const remainingDelay = minDelay - elapsedTime;

        if (remainingDelay > 0) {
          setTimeout(() => {
            this.indexedVideos = [];
            this.applyFilterAndCount();
            this.loading = false;
            this.refreshing = false;
          }, remainingDelay);
        } else {
          this.indexedVideos = [];
          this.applyFilterAndCount();
          this.loading = false;
          this.refreshing = false;
        }
      });
  }

  private async processIndexedVideoPaths(
    basePath: string,
    indexedVideos: VideoFile[]
  ): Promise<VideoFile[]> {
    const joinedPromises = indexedVideos.map(async (video) => {
      const fullPath = await this.electronService.joinPaths(
        basePath,
        video.Path
      );
      return { ...video, Path: fullPath };
    });
    return Promise.all(joinedPromises);
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
    this.filteredIndexedVideos = this.indexedVideos.filter(
      (video) =>
        video.Path.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        video.ID.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.indexedVideoCount = this.filteredIndexedVideos.length;
  }
}
