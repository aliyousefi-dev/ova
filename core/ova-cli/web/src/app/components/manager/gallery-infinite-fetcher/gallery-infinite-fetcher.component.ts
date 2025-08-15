import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GalleryViewComponent } from '../../containers/gallery-view/gallery-view.component';
import { VideoData } from '../../../data-types/video-data';
import { CentralFetchService } from '../../../services/api/central-fetch';

@Component({
  selector: 'app-gallery-infinite-fetcher',
  standalone: true,
  imports: [CommonModule, RouterModule, GalleryViewComponent],
  templateUrl: './gallery-infinite-fetcher.component.html',
})
export class GalleryInfiniteFetcher implements OnInit {
  @Input() isMiniView: boolean = false;
  @Input() PreviewPlayback: boolean = false;
  @Input() route: string = 'recent'; // @Input for route, default is 'recent'

  videos: VideoData[] = [];
  CurrentBucket: number = 1;
  TotalBuckets: number = 1;
  TotalVideos: number = 0;
  loading: boolean = false;
  noVideos: boolean = false; // Track if there are no videos

  @ViewChild('scrollContainer') scrollContainer: any;

  constructor(
    private centralFetchService: CentralFetchService // Inject CentralFetchService
  ) {}

  ngOnInit(): void {
    this.initialLoad();
  }

  initialLoad() {
    this.videos = [];
    this.loading = true;

    // Fetch gallery data based on the input route
    this.centralFetchService
      .fetchGallery(this.route, 1)
      .subscribe((videoDetails) => {
        this.CurrentBucket = 1; // First bucket
        this.TotalBuckets = videoDetails.totalBuckets; // Total number of buckets (can be adjusted)
        this.TotalVideos = videoDetails.totalVideos; // Total videos count, can be updated based on response

        // If no videos are found, set the noVideos flag to true
        if (this.TotalVideos === 0) {
          this.noVideos = true;
        } else {
          this.videos = videoDetails.videos;
        }

        this.loading = false;
      });
  }

  loadMore() {
    if (
      this.TotalBuckets === 1 ||
      this.CurrentBucket >= this.TotalBuckets ||
      this.loading ||
      this.noVideos // Prevent loading more if there are no videos
    ) {
      return;
    }

    this.loading = true;
    this.CurrentBucket++;

    // Fetch more videos based on the current bucket and route
    this.centralFetchService
      .fetchGallery(this.route, this.CurrentBucket)
      .subscribe((videoDetails) => {
        this.videos = [...this.videos, ...videoDetails.videos];
        this.loading = false;
      });
  }

  onScroll(event: any) {
    // Check if we've scrolled to the bottom
    const condition: boolean =
      event.target.offsetHeight + event.target.scrollTop + 2 >=
      event.target.scrollHeight;

    if (condition && !this.loading && !this.noVideos) {
      this.loadMore();
    }
  }
}
