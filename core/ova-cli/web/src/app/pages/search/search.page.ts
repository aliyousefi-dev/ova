import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  Subscription,
  of,
  map,
  filter,
} from 'rxjs';
import { ActivatedRoute, Router, Params } from '@angular/router';

import { AutoCompleteSearchBarComponent } from '../../components/utility/autocomplete-search-bar/autocomplete-search-bar.component';
import { VideoGalleryComponent } from '../../components/containers/video-gallery/video-gallery.component';
import { SearchApiService } from '../../services/api/search-api.service';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AutoCompleteSearchBarComponent,
    VideoGalleryComponent,
  ],
  templateUrl: './search.page.html',
})
export class SearchPage implements OnInit, OnDestroy {
  searchTerm: string = '';
  sortOption: string = 'titleAsc';
  advancedSearchEnabled: boolean = false;
  tagSearchEnabled: boolean = false;
  loading: boolean = false;
  videos: any[] = [];

  currentPage: number = 1;
  limit: number = 20;

  resolutionFilter: string = '';
  durationFilter: string = '';
  uploadFrom: string = '';
  uploadTo: string = '';

  totalCount: number = 0;

  // Change this subscription to listen to the URL query params for the main search
  // and remove the direct API call in ngOnInit to avoid double-fetching.
  private queryParamsSubscription!: Subscription;

  constructor(
    private searchapi: SearchApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.queryParamsSubscription = this.route.queryParams
      .pipe(
        debounceTime(100), // Small debounce for URL changes
        map((params: Params) => {
          // Update component state first from URL params
          this.searchTerm = params['q'] || '';
          this.sortOption = params['sort'] || 'titleAsc';
          this.resolutionFilter = params['res'] || '';
          this.durationFilter = params['dur'] || '';
          this.uploadFrom = params['from'] || '';
          this.uploadTo = params['to'] || '';
          this.tagSearchEnabled = params['tagsOnly'] === 'true';
          this.advancedSearchEnabled = params['adv'] === 'true';
          this.currentPage = params['page'] ? +params['page'] : 1;

          // Return the full set of parameters relevant to the API search
          return {
            q: this.searchTerm,
            tagsOnly: this.tagSearchEnabled,
            adv: this.advancedSearchEnabled,
          };
        }),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        // Trigger the actual API search here based on URL query params
        switchMap((apiSearchState) => {
          const { q, tagsOnly, adv } = apiSearchState;

          const searchParams: { query?: string; tags?: string[] } = {};
          const tags = q
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t.length > 0);

          const shouldPerformApiSearch =
            q.trim() !== '' || tags.length > 0 || adv;

          if (!shouldPerformApiSearch) {
            this.videos = [];
            this.totalCount = 0;
            this.loading = false;
            return of(null);
          }

          if (tagsOnly) {
            if (tags.length === 0 && q.trim() === '') {
              this.videos = [];
              this.totalCount = 0;
              this.loading = false;
              return of(null);
            }
            searchParams.tags = tags;
          } else {
            if (q.trim()) {
              searchParams.query = q;
            }
            if (tags.length > 0) {
              searchParams.tags = tags;
            }
          }

          this.loading = true;
          return this.searchapi.searchVideos(searchParams);
        })
      )
      .subscribe({
        next: (response) => {
          this.videos = response?.data.results || [];
          this.totalCount = response?.data.totalCount || 0;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error during video search:', err);
          this.videos = [];
          this.totalCount = 0;
          this.loading = false;
        },
      });
  }

  // Method to update URL with current search parameters
  private updateUrlParams() {
    const queryParams: Params = {};

    if (this.searchTerm) queryParams['q'] = this.searchTerm;
    queryParams['sort'] =
      this.sortOption === 'titleAsc' ? null : this.sortOption;

    queryParams['adv'] = this.advancedSearchEnabled ? true : null;
    queryParams['tagsOnly'] = this.tagSearchEnabled ? true : null;

    queryParams['res'] = this.resolutionFilter || null;
    queryParams['dur'] = this.durationFilter || null;

    queryParams['from'] = this.uploadFrom || null;
    queryParams['to'] = this.uploadTo || null;

    if (this.currentPage > 1) queryParams['page'] = this.currentPage;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  // This method is now triggered by the autocomplete component's searchSubmitted output
  // or by the manual "Search" button click.
  onSearchSubmitted(term: string) {
    this.searchTerm = term; // Update the local searchTerm property
    this.currentPage = 1; // Always reset to the first page for a new search
    this.updateUrlParams(); // Trigger URL update, which then triggers the main search via queryParamsSubscription
  }

  // This method is called when a suggestion is selected (clicked or Enter on highlighted)
  onSuggestionSelected(suggestion: string): void {
    // When a suggestion is selected, the autocomplete component also emits searchSubmitted,
    // so this method is mostly for logging or any *additional* logic specific to suggestion selection.
    // The main search will be handled by onSearchSubmitted.
    console.log('Suggestion selected in DiscoverPage:', suggestion);
  }

  onTagSearchToggle() {
    this.currentPage = 1;
    this.updateUrlParams();
  }

  onSortOptionChange() {
    this.currentPage = 1;
    this.updateUrlParams();
  }

  get filteredVideos() {
    let processedVideos = [...this.videos];

    processedVideos = processedVideos.filter((video) => {
      const height = video.resolution?.height || 0;
      const duration = video.durationSeconds || 0;
      const uploadedAt = video.uploadedAt ? new Date(video.uploadedAt) : null;

      const matchesResolution =
        this.resolutionFilter === '' ||
        (this.resolutionFilter === '720p' && height === 720) ||
        (this.resolutionFilter === '1080p' && height === 1080) ||
        (this.resolutionFilter === '4K' && height >= 2160);

      let matchesAdvancedFilters = true;
      if (this.advancedSearchEnabled) {
        const matchesDuration =
          this.durationFilter === '' ||
          (this.durationFilter === 'short' && duration <= 300) ||
          (this.durationFilter === 'medium' &&
            duration > 300 &&
            duration <= 900) ||
          (this.durationFilter === 'long' &&
            duration > 900 &&
            duration <= 1800) ||
          (this.durationFilter === 'veryLong' &&
            duration > 1800 &&
            duration <= 3600) ||
          (this.durationFilter === 'extraLong' && duration > 3600);

        let matchesUploadDate = true;
        if (uploadedAt) {
          if (this.uploadFrom) {
            const fromDate = new Date(this.uploadFrom);
            fromDate.setHours(0, 0, 0, 0);
            if (uploadedAt < fromDate) matchesUploadDate = false;
          }
          if (this.uploadTo) {
            const toDate = new Date(this.uploadTo);
            toDate.setHours(23, 59, 59, 999);
            if (uploadedAt > toDate) matchesUploadDate = false;
          }
        }
        matchesAdvancedFilters = matchesDuration && matchesUploadDate;
      }

      return matchesResolution && matchesAdvancedFilters;
    });

    const sortedFilteredVideos = this.sortVideos(processedVideos);

    this.totalCount = sortedFilteredVideos.length;

    const start = (this.currentPage - 1) * this.limit;
    return sortedFilteredVideos.slice(start, start + this.limit);
  }

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
    return Math.ceil(this.totalCount / this.limit);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.updateUrlParams();
  }

  setResolutionFilter(res: string) {
    this.resolutionFilter = res;
    this.currentPage = 1;
    this.updateUrlParams();
  }

  setDurationFilter(filter: string) {
    this.durationFilter = filter;
    this.currentPage = 1;
    this.updateUrlParams();
  }

  setUploadFrom(event: Event) {
    this.uploadFrom = (event.target as HTMLInputElement).value;
    this.currentPage = 1;
    this.updateUrlParams();
  }

  setUploadTo(event: Event) {
    this.uploadTo = (event.target as HTMLInputElement).value;
    this.currentPage = 1;
    this.updateUrlParams();
  }

  clearUploadDateFilter() {
    this.uploadFrom = '';
    this.uploadTo = '';
    this.currentPage = 1;
    this.updateUrlParams();
  }

  onAdvancedSearchToggle() {
    this.currentPage = 1;
    this.updateUrlParams();
  }

  ngOnDestroy() {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }
}
