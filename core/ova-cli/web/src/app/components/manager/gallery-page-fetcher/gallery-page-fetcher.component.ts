import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { VideoData } from '../../../data-types/video-data';
import { GalleryViewComponent } from '../../containers/gallery-view/gallery-view.component';
import { PageControlsComponent } from '../../utility/page-controls/page-controls.component';
import { CentralFetchService } from '../../../services/api/central-fetch';

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
  @Input() route: string = 'recent'; // @Input for route, default is 'recent'

  videos: VideoData[] = [];
  CurrentBucket: number = 1;
  TotalBuckets: number = 1;
  BucketContentSize: number = 0;
  TotalVideos: number = 0;
  loading: boolean = false;

  constructor(
    private centralFetchService: CentralFetchService, // Inject CentralFetchService
    private router: Router,
    private activatedRoute: ActivatedRoute // Make sure to inject ActivatedRoute
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

    // Fetch gallery data based on the route
    this.centralFetchService.fetchGallery(this.route, number).subscribe({
      next: (response) => {
        if (response) {
          this.CurrentBucket = response.currentBucket;
          this.TotalBuckets = response.totalBuckets; // You can update this based on the response structure
          this.TotalVideos = response.totalVideos; // Adjust this if the total count is provided differently
          this.BucketContentSize = response.bucketContentSize; // Adjust if needed

          console.log(this.TotalBuckets);

          this.videos = response.videos;
          this.loading = false;

          // Update the URL with the current bucket number
          this.router.navigate([], {
            queryParams: { bucket: number },
            queryParamsHandling: 'merge', // Keep existing query params
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
