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
import { SearchApiService } from '../../services/api/search-api.service';

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
  templateUrl: './discover.page.html',
})
export class DiscoverPage implements OnDestroy {
  searchTerm: string = '';
  sortOption: string = 'titleAsc';
  // New property to control visibility of advanced filters
  advancedSearchEnabled: boolean = false;
  tagSearchEnabled: boolean = false;
  loading: boolean = false;
  videos: any[] = []; // ALL results from server

  currentPage: number = 1;
  limit: number = 20; // items per page

  resolutionFilter: string = ''; // '', '720p', '1080p', '4K'
  durationFilter: string = ''; // '', 'short', 'medium', 'long'
  uploadFrom: string = ''; // YYYY-MM-DD format (date string)
  uploadTo: string = '';

  totalCount: number = 0;

  private searchSubject = new Subject<void>();
  private searchSubscription: Subscription;

  constructor(private searchapi: SearchApiService) {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(300),
        // If you want to use distinctUntilChanged here, you'd need to emit a complex object
        // containing all relevant search/filter parameters for comparison, e.g.,
        // distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
        // For simplicity and to ensure all filter changes trigger a re-evaluation of `filteredVideos` getter,
        // I'll keep it commented out for now unless specifically needed for backend API calls.
        switchMap(() => {
          // Construct search parameters based on current state
          const searchParams: { query?: string; tags?: string[] } = {};
          const tags = this.searchTerm
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t.length > 0);

          if (this.tagSearchEnabled) {
            // If tag search is enabled, only search by tags
            if (tags.length === 0) {
              this.videos = [];
              this.totalCount = 0;
              this.loading = false;
              return of(null); // No tags, no search
            }
            searchParams.tags = tags;
          } else {
            // If tag search is not enabled, search by query
            if (!this.searchTerm.trim()) {
              this.videos = [];
              this.totalCount = 0;
              this.loading = false;
              return of(null); // No search term, no search
            }
            searchParams.query = this.searchTerm;
            // Optionally, if you want tags to also filter during a regular search:
            if (tags.length > 0) {
              searchParams.tags = tags;
            }
          }

          this.loading = true;
          this.currentPage = 1; // Reset page on any new search trigger
          return this.searchapi.searchVideos(searchParams);
        })
      )
      .subscribe({
        next: (response) => {
          this.videos = response?.data.results || [];
          // totalCount is now updated by the filteredVideos getter
          this.loading = false;
        },
        error: (err) => {
          console.error('Error during video search:', err);
          this.videos = [];
          this.totalCount = 0;
          this.loading = false;
        },
      });

    // Initial search or load on component creation
    // This will trigger a search based on initial searchTerm (empty by default)
    this.searchSubject.next();
  }

  onSearchTermChange(term: string) {
    this.searchTerm = term;
    this.searchSubject.next();
  }

  onTagSearchToggle() {
    // Trigger search immediately on toggle change, as it changes the search logic
    this.searchSubject.next();
  }

  onSortOptionChange() {
    // No need to call searchSubject.next() as sorting/filtering is done client-side
    // and `filteredVideos` getter will re-calculate automatically on change detection.
  }

  // Calculate videos to display on current page after sorting and filtering
  get filteredVideos() {
    // Start with the raw videos received from the API
    let processedVideos = [...this.videos];

    // Apply client-side filters
    processedVideos = processedVideos.filter((video) => {
      const height = video.resolution?.height || 0;
      const duration = video.durationSeconds || 0;
      const uploadedAt = video.uploadedAt ? new Date(video.uploadedAt) : null;

      const matchesResolution =
        this.resolutionFilter === '' ||
        (this.resolutionFilter === '720p' && height === 720) ||
        (this.resolutionFilter === '1080p' && height === 1080) ||
        (this.resolutionFilter === '4K' && height >= 2160);

      // Apply duration, upload date, and tag search filters only if advancedSearchEnabled is true
      let matchesAdvancedFilters = true;
      if (this.advancedSearchEnabled) {
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

        let matchesUploadDate = true;
        if (uploadedAt) {
          if (this.uploadFrom) {
            const fromDate = new Date(this.uploadFrom);
            // Set to start of the day for proper comparison
            fromDate.setHours(0, 0, 0, 0);
            if (uploadedAt < fromDate) matchesUploadDate = false;
          }
          if (this.uploadTo) {
            const toDate = new Date(this.uploadTo);
            // Set to end of the day to include the selected 'to' date
            toDate.setHours(23, 59, 59, 999);
            if (uploadedAt > toDate) matchesUploadDate = false;
          }
        }
        matchesAdvancedFilters = matchesDuration && matchesUploadDate;
      }

      return matchesResolution && matchesAdvancedFilters;
    });

    // Apply client-side sorting to the filtered results
    const sortedFilteredVideos = this.sortVideos(processedVideos);

    this.totalCount = sortedFilteredVideos.length; // update total count based on all applied filters/sorts

    // Apply pagination
    const start = (this.currentPage - 1) * this.limit;
    return sortedFilteredVideos.slice(start, start + this.limit);
  }

  // Helper method to sort videos
  sortVideos(videos: any[]): any[] {
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
    // totalCount is already updated by the filteredVideos getter
    return Math.ceil(this.totalCount / this.limit);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
  }

  setResolutionFilter(res: string) {
    this.resolutionFilter = res;
    this.currentPage = 1; // Reset page to first when filter changes
  }

  setDurationFilter(filter: string) {
    this.durationFilter = filter;
    this.currentPage = 1; // Reset page to first when filter changes
  }

  // Modified to accept Event and extract value
  setUploadFrom(event: Event) {
    this.uploadFrom = (event.target as HTMLInputElement).value;
    this.currentPage = 1; // Reset page to first when filter changes
  }

  // Modified to accept Event and extract value
  setUploadTo(event: Event) {
    this.uploadTo = (event.target as HTMLInputElement).value;
    this.currentPage = 1; // Reset page to first when filter changes
  }

  clearUploadDateFilter() {
    this.uploadFrom = '';
    this.uploadTo = '';
    this.currentPage = 1; // Reset page to first when filter changes
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
  }
}
