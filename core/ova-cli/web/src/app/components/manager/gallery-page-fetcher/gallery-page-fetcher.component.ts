import { Component, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { LatestVideosService } from '../../../services/api/latest-api.service';
import { VideoApiService } from '../../../services/api/video-api.service';
import { VideoData } from '../../../data-types/video-data';
import { GalleryViewComponent } from '../../containers/gallery-view/gallery-view.component';
import { PageControlsComponent } from '../../utility/page-controls/page-controls.component';
import { Input } from '@angular/core';

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

  videos: VideoData[] = [];
  CurrentBucket: number = 1;
  TotalBuckets: number = 1;
  BucketContentSize: number = 0;
  TotalVideos: number = 0;
  loading: boolean = false;

  constructor(
    private latestVideosService: LatestVideosService,
    private videoApiService: VideoApiService,
    private router: Router,
    private route: ActivatedRoute // Injecting the ActivatedRoute here
  ) {}

  ngOnInit(): void {
    // Read the page number from the URL (query parameter 'bucket')
    const bucketParam = this.route.snapshot.queryParamMap.get('bucket');
    const bucketNumber = bucketParam ? parseInt(bucketParam, 10) : 1; // Default to 1 if no bucket param is found
    this.loadPage(bucketNumber);
  }

  loadPage(number: number): void {
    this.loading = true;

    this.latestVideosService.getLatestVideos(number).subscribe({
      next: (response) => {
        if (response.data) {
          this.CurrentBucket = response.data.currentBucket;
          this.TotalBuckets = response.data.totalBuckets;
          this.TotalVideos = response.data.totalVideos;
          this.BucketContentSize = response.data.bucketContentSize;

          this.videoApiService
            .getVideosByIds(response.data.videoIds)
            .subscribe((videoDetails) => {
              this.videos = videoDetails.data;
              this.loading = false;

              // Update the URL with the current bucket number
              this.router.navigate([], {
                queryParams: { bucket: number },
                queryParamsHandling: 'merge', // Keep existing query params
              });
            });
        }
      },
      error: (error) => {
        console.error('[GalleryFetcherFull] Error loading videos:', error);
      },
    });
  }
}
