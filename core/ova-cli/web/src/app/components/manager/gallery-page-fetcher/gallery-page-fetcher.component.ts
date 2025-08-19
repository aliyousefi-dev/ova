import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { VideoData } from '../../../data-types/video-data';
import { GalleryViewComponent } from '../../containers/gallery-view/gallery-view.component';
import { PageControlsComponent } from '../../utility/page-controls/page-controls.component';
import { CentralFetchService } from '../../../services/ova-backend/central-fetch';

@Component({
  selector: 'app-gallery-page-fetcher',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    GalleryViewComponent,
    PageControlsComponent,
  ],
  templateUrl: './gallery-page-fetcher.component.html',
})
export class GalleryPageFetcher implements OnInit {
  @Input() isMiniView: boolean = false;
  @Input() PreviewPlayback: boolean = false;
  @Input() route: string = 'recent'; // Default route is 'recent'
  @Input() slug: string = ''; // New Input for slug (for playlists)

  videos: VideoData[] = [];
  CurrentBucket: number = 1;
  TotalBuckets: number = 1;
  BucketContentSize: number = 0;
  TotalVideos: number = 0;
  loading: boolean = false;

  constructor(
    private centralFetchService: CentralFetchService, // Inject CentralFetchService
    private router: Router,
    private activatedRoute: ActivatedRoute // Inject ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Read the page number from the URL (query parameter 'bucket')
    const bucketParam =
      this.activatedRoute.snapshot.queryParamMap.get('bucket');
    const bucketNumber = bucketParam ? parseInt(bucketParam, 10) : 1; // Default to 1 if no bucket param is found
    this.loadPage(bucketNumber);
  }

  loadPage(number: number): void {
    this.loading = true;

    if (this.route === 'playlists' && this.slug) {
      // If route is 'playlists', use the slug for fetching playlist content
      this.centralFetchService
        .fetchGallery(this.route, number, this.slug)
        .subscribe({
          next: (response) => {
            if (response) {
              this.CurrentBucket = response.currentBucket;
              this.TotalBuckets = response.totalBuckets;
              this.TotalVideos = response.totalVideos;
              this.BucketContentSize = response.bucketContentSize;

              console.log(this.TotalBuckets);

              this.videos = response.videos;
              this.loading = false;

              // Update the URL with the current bucket number
              this.router.navigate([], {
                queryParams: { bucket: number },
                queryParamsHandling: 'merge',
              });
            }
          },
          error: (error) => {
            console.error('[GalleryPageFetcher] Error loading videos:', error);
            this.loading = false;
          },
        });
    } else {
      // For other routes like 'recent', 'watched', etc.
      this.centralFetchService.fetchGallery(this.route, number).subscribe({
        next: (response) => {
          if (response) {
            this.CurrentBucket = response.currentBucket;
            this.TotalBuckets = response.totalBuckets;
            this.TotalVideos = response.totalVideos;
            this.BucketContentSize = response.bucketContentSize;

            console.log(this.TotalBuckets);

            this.videos = response.videos;
            this.loading = false;

            // Update the URL with the current bucket number
            this.router.navigate([], {
              queryParams: { bucket: number },
              queryParamsHandling: 'merge',
            });
          }
        },
        error: (error) => {
          console.error('[GalleryPageFetcher] Error loading videos:', error);
          this.loading = false;
        },
      });
    }
  }
}
