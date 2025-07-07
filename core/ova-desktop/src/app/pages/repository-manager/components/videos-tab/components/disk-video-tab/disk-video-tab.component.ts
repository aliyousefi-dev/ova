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
import { ElectronService } from '../../../../../../services/common-electron.service';

@Component({
  selector: 'app-disk-video-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './disk-video-tab.component.html',
})
export class DiskVideoTabComponent implements OnInit, OnChanges {
  @Input() repositoryAddress: string = ''; // Input from parent

  diskVideos: VideoFileDisk[] = [];
  searchQuery: string = '';
  diskVideoCount: number = 0;
  filteredDiskVideos: VideoFileDisk[] = [];
  loading: boolean = false; // Internal loading for this tab
  refreshing: boolean = false; // Internal refreshing for this tab

  constructor(
    private ovacliService: OvacliService,
    private electronService: ElectronService
  ) {}

  ngOnInit(): void {
    if (this.repositoryAddress) {
      this.fetchDiskVideos(true); // Initial fetch for this tab
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['repositoryAddress'] &&
      changes['repositoryAddress'].currentValue !==
        changes['repositoryAddress'].previousValue
    ) {
      if (this.repositoryAddress) {
        this.fetchDiskVideos(true); // Re-fetch if repository address changes
      } else {
        this.diskVideos = [];
        this.applyFilterAndCount();
      }
    }
  }

  fetchDiskVideos(initialLoad: boolean = false): void {
    if (!this.repositoryAddress) {
      console.warn(
        'Cannot fetch disk videos: repositoryAddress is not provided.'
      );
      this.diskVideos = [];
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
      .runOvacliRepoVideos(this.repositoryAddress)
      .then(async (diskVideosRaw) => {
        const elapsedTime = Date.now() - startTime;
        const remainingDelay = minDelay - elapsedTime;

        const processedDiskVideos = await this.processDiskVideoPaths(
          this.repositoryAddress,
          diskVideosRaw
        );

        if (remainingDelay > 0) {
          setTimeout(() => {
            this.diskVideos = processedDiskVideos;
            this.sortVideosByPath(this.diskVideos);
            this.applyFilterAndCount();
            this.loading = false;
            this.refreshing = false;
          }, remainingDelay);
        } else {
          this.diskVideos = processedDiskVideos;
          this.sortVideosByPath(this.diskVideos);
          this.applyFilterAndCount();
          this.loading = false;
          this.refreshing = false;
        }
      })
      .catch((err) => {
        console.error('Error fetching disk videos:', err);
        const elapsedTime = Date.now() - startTime;
        const remainingDelay = minDelay - elapsedTime;

        if (remainingDelay > 0) {
          setTimeout(() => {
            this.diskVideos = [];
            this.applyFilterAndCount();
            this.loading = false;
            this.refreshing = false;
          }, remainingDelay);
        } else {
          this.diskVideos = [];
          this.applyFilterAndCount();
          this.loading = false;
          this.refreshing = false;
        }
      });
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
    this.filteredDiskVideos = this.diskVideos.filter((video) =>
      video.Path.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.diskVideoCount = this.filteredDiskVideos.length;
  }
}
