import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  switchMap,
  Subscription,
  of,
} from 'rxjs';

import { TopNavBarComponent } from '../../components/top-nav-bar/top-nav-bar.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar';
import { VideoGridComponent } from '../../components/video-grid/video-grid.component';
import { SearchApiService } from '../../services/search-api.service';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TopNavBarComponent,
    SearchBarComponent,
    VideoGridComponent,
  ],
  templateUrl: './discover.component.html',
})
export class DiscoverComponent implements OnDestroy {
  searchTerm: string = '';
  sortOption: string = 'titleAsc';
  tagSearchEnabled: boolean = false;
  loading: boolean = false;
  videos: any[] = []; // ALL results from server

  currentPage: number = 1;
  limit: number = 20; // items per page

  resolutionFilter: string = ''; // '', '720p', '1080p', '4K'
  durationFilter: string = ''; // '', 'short', 'medium', 'long'

  totalCount: number = 0;

  private searchSubject = new Subject<void>();
  private searchSubscription: Subscription;

  constructor(private searchapi: SearchApiService) {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(300),
        switchMap(() => {
          if (this.tagSearchEnabled) {
            // When tagSearchEnabled, only search tags (split searchTerm by spaces)
            const tags = this.searchTerm
              .split(' ')
              .map((t) => t.trim())
              .filter((t) => t.length > 0);
            if (tags.length === 0) {
              this.videos = [];
              this.totalCount = 0;
              this.loading = false;
              return of(null);
            }
            this.loading = true;
            this.currentPage = 1; // reset page on new search
            return this.searchapi.searchVideos({ tags });
          } else {
            // Normal search by query string
            if (!this.searchTerm.trim()) {
              this.videos = [];
              this.totalCount = 0;
              this.loading = false;
              return of(null);
            }
            this.loading = true;
            this.currentPage = 1;
            return this.searchapi.searchVideos({ query: this.searchTerm });
          }
        })
      )
      .subscribe({
        next: (response) => {
          this.videos = response?.data.results || [];
          this.totalCount = this.videos.length;
          this.loading = false;
        },
        error: () => {
          this.videos = [];
          this.totalCount = 0;
          this.loading = false;
        },
      });
  }

  onSearchTermChange(term: string) {
    this.searchTerm = term;
    this.searchSubject.next();
  }

  onTagSearchToggle() {
    // Trigger search immediately on toggle change
    this.searchSubject.next();
    console.log('toggle');
  }

  // Calculate videos to display on current page after sorting and filtering
  get filteredVideos() {
    const sorted = this.sortVideos(this.videos);
    const filtered = sorted.filter((video) => {
      const height = video.resolution?.height || 0;
      const duration = video.durationSeconds || 0;

      const matchesResolution =
        this.resolutionFilter === '' ||
        (this.resolutionFilter === '720p' && height === 720) ||
        (this.resolutionFilter === '1080p' && height === 1080) ||
        (this.resolutionFilter === '4K' && height >= 2160);

      const matchesDuration =
        this.durationFilter === '' ||
        (this.durationFilter === 'short' && duration <= 300) || // ≤ 5min
        (this.durationFilter === 'medium' &&
          duration > 300 &&
          duration <= 900) || // 5-15min
        (this.durationFilter === 'long' &&
          duration > 900 &&
          duration <= 1800) || // 15-30min
        (this.durationFilter === 'veryLong' &&
          duration > 1800 &&
          duration <= 3600) || // 30-60min
        (this.durationFilter === 'extraLong' && duration > 3600); // > 60min

      return matchesResolution && matchesDuration;
    });

    this.totalCount = filtered.length; // update count for filtered results

    const start = (this.currentPage - 1) * this.limit;
    return filtered.slice(start, start + this.limit);
  }

  sortVideos(videos: any[]) {
    switch (this.sortOption) {
      case 'titleAsc':
        return [...videos].sort((a, b) => a.title.localeCompare(b.title));
      case 'titleDesc':
        return [...videos].sort((a, b) => b.title.localeCompare(a.title));
      case 'durationAsc':
        return [...videos].sort(
          (a, b) => a.durationSeconds - b.durationSeconds
        );
      case 'durationDesc':
        return [...videos].sort(
          (a, b) => b.durationSeconds - a.durationSeconds
        );
      case 'newest':
        return [...videos].sort(
          (a, b) =>
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
      case 'oldest':
        return [...videos].sort(
          (a, b) =>
            new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
        );
      default:
        return videos;
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.limit);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
  }

  setResolutionFilter(res: string) {
    this.resolutionFilter = res;
    this.currentPage = 1; // Reset page to first
  }

  setDurationFilter(filter: string) {
    this.durationFilter = filter;
    this.currentPage = 1;
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
  }
}
