import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs'; // Import Subscription

import { LatestVideosService } from '../../services/api/latest-api.service';
import { VideoApiService } from '../../services/api/video-api.service';
import { VideoData } from '../../data-types/video-data';
import { VideoGalleryComponent } from '../../components/containers/video-gallery/video-gallery.component';

@Component({
  selector: 'app-latest-page',
  standalone: true,
  imports: [CommonModule, FormsModule, VideoGalleryComponent],
  templateUrl: './recent.page.html',
})
export class RecentPage implements OnInit, OnDestroy {
  videos: VideoData[] = [];
  loading = true;

  currentPage = 1;
  limit = 100; // Number of videos per page
  totalVideos = 0;
  totalPages = 1; // Default to 1 page

  paginationPages: (number | string)[] = []; // New property for smart pagination

  private queryParamsSubscription!: Subscription; // To manage subscription cleanup

  constructor(
    private latestVideosService: LatestVideosService,
    private videoApiService: VideoApiService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.queryParamsSubscription = this.activatedRoute.queryParams.subscribe(
      (params) => {
        const page = parseInt(params['page'] || '1', 10);

        // Only load videos if the page parameter has actually changed
        // or if it's the initial load and currentPage isn't yet set.
        if (
          page !== this.currentPage ||
          (this.videos.length === 0 && !this.loading && !params['page'])
        ) {
          this.currentPage = page;
          this.loadVideos();
        }
      }
    );

    // Ensure initial load if there are no query params and subscription didn't trigger it.
    // This handles cases where you navigate directly to /latest without a '?page=X'.
    if (!this.activatedRoute.snapshot.queryParams['page']) {
      this.loadVideos();
    }
  }

  loadVideos() {
    this.loading = true;
    this.videos = []; // Clear videos to show loading state more clearly

    // Calculate the 'start' and 'end' indices for the API call
    // 'start' is the offset (0-based index of the first item on the current page)
    const startIndex = (this.currentPage - 1) * this.limit;
    // 'end' is the inclusive 0-based index of the last item on the current page
    const endIndex = startIndex + this.limit - 1;

    console.log(
      `[LatestPage] Requesting videos: page=${this.currentPage}, startIndex=${startIndex}, endIndex=${endIndex}`
    );

    // Fetch the latest video IDs for the current page using the calculated start and end indices
    this.latestVideosService.getLatestVideos(startIndex, endIndex).subscribe({
      next: (response) => {
        console.log('[LatestPage] getLatestVideos response:', response);

        if (!response || !response.data) {
          console.error(
            '[LatestPage] Invalid response format for latest videos:',
            response
          );
          this.videos = [];
          this.totalPages = 1;
          this.loading = false;
          this.generatePaginationPages(); // Update pagination even on error
          return;
        }

        const videoIds = response.data.videoIds || [];
        this.totalVideos = response.data.totalVideos || 0;

        console.log(
          '[LatestPage] Fetched Video IDs for current page:',
          videoIds
        );
        console.log(
          '[LatestPage] Total Videos reported by API:',
          this.totalVideos
        );

        // Calculate total pages based on totalVideos and limit
        this.totalPages = Math.max(1, Math.ceil(this.totalVideos / this.limit)); // Ensure at least 1 total page

        // Adjust currentPage if it's out of bounds after totalPages calculation
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
          console.warn(
            `[LatestPage] currentPage (${this.currentPage}) is out of bounds. Adjusting to totalPages (${this.totalPages}).`
          );
          // Navigate to the last valid page. The queryParamsSubscription will then trigger loadVideos again.
          this.router.navigate([], {
            relativeTo: this.activatedRoute,
            queryParams: { page: this.totalPages },
            queryParamsHandling: 'merge',
          });
          return; // Exit here, as the subscription will re-trigger loadVideos with the correct page
        }

        // Generate pagination pages after totalPages and currentPage are set
        this.generatePaginationPages();

        if (videoIds.length === 0) {
          this.videos = [];
          this.loading = false;
          console.log('[LatestPage] No video IDs received for this page.');
          return;
        }

        // Fetch the full video data using the video IDs
        this.videoApiService.getVideosByIds(videoIds).subscribe({
          next: (videoDataResponse) => {
            console.log(
              '[LatestPage] getVideosByIds response:',
              videoDataResponse
            );
            if (videoDataResponse && videoDataResponse.data) {
              this.videos = videoDataResponse.data;
              console.log(
                '[LatestPage] Videos loaded successfully:',
                this.videos.length,
                'videos'
              );
            } else {
              this.videos = [];
              console.warn(
                '[LatestPage] No video data found for the fetched IDs.'
              );
            }
            this.loading = false;
          },
          error: (videoApiError) => {
            console.error(
              '[LatestPage] Error fetching full video data:',
              videoApiError
            );
            this.videos = [];
            this.loading = false;
          },
        });
      },
      error: (latestVideosError) => {
        console.error(
          '[LatestPage] Error fetching latest video IDs:',
          latestVideosError
        );
        this.videos = [];
        this.totalPages = 1; // Reset total pages on error
        this.loading = false;
        this.generatePaginationPages(); // Update pagination even on error
      },
    });
  }

  // Generates the array of page numbers and '...' for the pagination display
  generatePaginationPages() {
    this.paginationPages = [];
    const numSurroundingPages = 2; // How many pages to show directly around the current page (e.g., current-2, current-1, current, current+1, current+2)

    if (this.totalPages <= 1) {
      return; // No pagination needed if only one page or less
    }

    // Always add the first page
    this.paginationPages.push(1);

    // Calculate the start and end of the "window" of pages around the current page
    let lowerBound = Math.max(2, this.currentPage - numSurroundingPages);
    let upperBound = Math.min(
      this.totalPages - 1,
      this.currentPage + numSurroundingPages
    );

    // Adjust bounds to ensure a minimum number of pages around current,
    // especially when near the start or end.
    // If current page is close to the beginning, extend the upper bound
    if (this.currentPage <= numSurroundingPages + 1) {
      upperBound = Math.min(this.totalPages - 1, 2 * numSurroundingPages + 1);
    }
    // If current page is close to the end, extend the lower bound
    if (this.currentPage >= this.totalPages - numSurroundingPages) {
      lowerBound = Math.max(2, this.totalPages - 2 * numSurroundingPages);
    }

    // Add leading ellipsis if needed (i.e., if the first page in the window is not 2)
    if (lowerBound > 2) {
      this.paginationPages.push('...');
    }

    // Add pages within the calculated range
    for (let i = lowerBound; i <= upperBound; i++) {
      this.paginationPages.push(i);
    }

    // Add trailing ellipsis if needed (i.e., if the last page in the window is not totalPages - 1)
    if (upperBound < this.totalPages - 1) {
      this.paginationPages.push('...');
    }

    // Always add the last page if it's not the first page and not already included
    if (
      this.totalPages > 1 &&
      !this.paginationPages.includes(this.totalPages)
    ) {
      this.paginationPages.push(this.totalPages);
    }

    // Final pass to ensure no consecutive '...' (though the logic should prevent this now)
    // and to handle any edge cases where bounds might overlap with 1 or totalPages
    const finalPages: (number | string)[] = [];
    let lastAdded: number | string | null = null;
    for (const p of this.paginationPages) {
      if (p === '...' && lastAdded === '...') {
        continue; // Skip consecutive '...'
      }
      finalPages.push(p);
      lastAdded = p;
    }
    this.paginationPages = finalPages;
  }

  goToPage(page: number | string) {
    // Prevent navigation if the clicked item is an ellipsis or an invalid page number
    if (
      typeof page === 'string' ||
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage
    ) {
      console.log(
        `[LatestPage] Invalid page navigation attempt: ${page}. Current page: ${this.currentPage}, Total pages: ${this.totalPages}`
      );
      return;
    }

    console.log(`[LatestPage] Navigating to page: ${page}`);

    // Update the URL with the current page number.
    // The queryParamsSubscription in ngOnInit will detect this change and call loadVideos()
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { page: page },
      queryParamsHandling: 'merge',
    });

    // Scroll to the top of the page for a better user experience
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }
}
