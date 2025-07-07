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
} from '../../../../../../services/ovacli.service';
import { ElectronService } from '../../../../../../services/common-electron.service';

@Component({
  selector: 'app-unindexed-video-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './unindexed-video-tab.component.html',
})
export class UnindexedVideoTabComponent implements OnInit, OnChanges {
  @Input() repositoryAddress: string = ''; // Input from parent

  indexedVideosForCategorization: VideoFile[] = [];
  diskVideosForCategorization: VideoFileDisk[] = [];
  unindexedVideos: VideoFileDisk[] = [];

  searchQuery: string = '';
  unindexedVideoCount: number = 0;
  filteredUnindexedVideos: VideoFileDisk[] = [];
  loading: boolean = false; // Internal loading for this tab
  refreshing: boolean = false; // Internal refreshing for this tab

  constructor(
    private ovacliService: OvacliService,
    private electronService: ElectronService
  ) {}

  ngOnInit(): void {
    if (this.repositoryAddress) {
      this.fetchAllVideosAndCategorize(true); // Initial fetch for this tab
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['repositoryAddress'] &&
      changes['repositoryAddress'].currentValue !==
        changes['repositoryAddress'].previousValue
    ) {
      if (this.repositoryAddress) {
        this.fetchAllVideosAndCategorize(true); // Re-fetch if repository address changes
      } else {
        this.unindexedVideos = [];
        this.applyFilterAndCount();
      }
    }
  }

  fetchAllVideosAndCategorize(initialLoad: boolean = false): void {
    if (!this.repositoryAddress) {
      console.warn(
        'Cannot fetch videos for unindexed tab: repositoryAddress is not provided.'
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

    const minDelay = 500;
    const startTime = Date.now();

    Promise.all([
      this.ovacliService.runOvacliVideoList(this.repositoryAddress),
      this.ovacliService.runOvacliRepoVideos(this.repositoryAddress),
    ])
      .then(async ([indexedVideosRaw, diskVideosRaw]) => {
        const elapsedTime = Date.now() - startTime;
        const remainingDelay = minDelay - elapsedTime;

        this.indexedVideosForCategorization =
          await this.processIndexedVideoPaths(
            this.repositoryAddress,
            indexedVideosRaw
          );
        this.diskVideosForCategorization = await this.processDiskVideoPaths(
          this.repositoryAddress,
          diskVideosRaw
        );

        if (remainingDelay > 0) {
          setTimeout(() => {
            this.categorizeVideos();
            this.applyFilterAndCount();
            this.loading = false;
            this.refreshing = false;
          }, remainingDelay);
        } else {
          this.categorizeVideos();
          this.applyFilterAndCount();
          this.loading = false;
          this.refreshing = false;
        }
      })
      .catch((err) => {
        console.error('Error fetching videos for unindexed tab:', err);
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

  private async processDiskVideoPaths(
    basePath: string,
    diskVideos: VideoFileDisk[]
  ): Promise<VideoFileDisk[]> {
    const joinedPromises = diskVideos.map(async (video) => {
      const fullPath = await this.electronService.joinPaths(
        basePath,
        video.Path
      );
      return { ...video, Path: fullPath };
    });
    return Promise.all(joinedPromises);
  }

  categorizeVideos(): void {
    const indexedPaths = new Set(
      this.indexedVideosForCategorization.map((video) => video.Path)
    );

    this.unindexedVideos = this.diskVideosForCategorization.filter(
      (diskVideo) => !indexedPaths.has(diskVideo.Path)
    );
    this.sortVideosByPath(this.unindexedVideos);
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
}
