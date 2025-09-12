import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GalleryViewComponent } from '../../containers/gallery-view/gallery-view.component';
import { VideoData } from '../../../data-types/video-data';
import { CentralFetchService } from '../../../services/ova-backend/central-fetch';
import { Router } from '@angular/router';
import { NavigationStart, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/internal/operators/filter';

@Component({
  selector: 'app-gallery-infinite-fetcher',
  standalone: true,
  imports: [CommonModule, RouterModule, GalleryViewComponent],
  templateUrl: './gallery-infinite-fetcher.component.html',
})
export class GalleryInfiniteFetcher implements OnInit {
  @Input() isMiniView: boolean = false;
  @Input() PreviewPlayback: boolean = false;
  @Input() route: string = 'recent'; // Default route is 'recent'
  @Input() slug: string = ''; // New Input for slug

  videos: VideoData[] = [];
  CurrentBucket: number = 1;
  TotalBuckets: number = 1;
  TotalVideos: number = 0;
  loading: boolean = false;
  noVideos: boolean = false; // Track if there are no videos
  lastPosition: number = 0;
  lastRoute: string = '';

  @ViewChild('scrollContainer') scrollContainer: any;

  constructor(
    private centralFetchService: CentralFetchService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initialLoad();
    this.FollowScroll();
  }

  FollowScroll() {
    this.router.events
      .pipe(
        filter(
          (events) =>
            events instanceof NavigationStart || events instanceof NavigationEnd
        )
      )
      .subscribe((event) => {
        if (event instanceof NavigationStart && event.url !== this.lastRoute) {
          this.lastRoute = this.router.url;
          this.lastPosition = this.scrollContainer.nativeElement.scrollTop; // get the scrollTop property
          // this.lastPosition = this.grid.nativeElement.scrollTop
        } else if (
          event instanceof NavigationEnd &&
          event.url === this.lastRoute
        ) {
          this.scrollContainer.nativeElement.scrollTop = this.lastPosition; // set scrollTop to last position
          // this.grid.nativeElement.firstChild.scrollTop  = this.lastPosition
        }
      });
  }

  initialLoad() {
    this.videos = [];
    this.loading = true;

    if (this.route === 'playlist-content' && this.slug) {
      // Fetch playlist content if route is 'playlists' and slug is provided
      this.centralFetchService
        .fetchGallery(this.route, 1, this.slug) // Pass slug for playlist
        .subscribe((videoDetails) => {
          this.CurrentBucket = 1; // First bucket
          this.TotalBuckets = videoDetails.totalBuckets;
          this.TotalVideos = videoDetails.totalVideos;

          if (this.TotalVideos === 0) {
            this.noVideos = true;
          } else {
            this.videos = videoDetails.videos;
          }

          this.loading = false;
        });
    } else {
      // Fetch gallery data for other routes (e.g., 'recent', 'watched', 'saved')
      this.centralFetchService
        .fetchGallery(this.route, 1)
        .subscribe((videoDetails) => {
          this.CurrentBucket = 1; // First bucket
          this.TotalBuckets = videoDetails.totalBuckets;
          this.TotalVideos = videoDetails.totalVideos;

          if (this.TotalVideos === 0) {
            this.noVideos = true;
          } else {
            this.videos = videoDetails.videos;
          }

          this.loading = false;
        });
    }
  }

  loadMore() {
    if (
      this.TotalBuckets === 1 ||
      this.CurrentBucket >= this.TotalBuckets ||
      this.loading ||
      this.noVideos
    ) {
      return;
    }

    this.loading = true;
    this.CurrentBucket++;

    if (this.route === 'playlists' && this.slug) {
      // Fetch more playlist content if route is 'playlists'
      this.centralFetchService
        .fetchGallery(this.route, this.CurrentBucket, this.slug) // Pass slug for playlist
        .subscribe((videoDetails) => {
          this.videos = [...this.videos, ...videoDetails.videos];
          this.loading = false;
        });
    } else {
      // Fetch more videos for other routes
      this.centralFetchService
        .fetchGallery(this.route, this.CurrentBucket)
        .subscribe((videoDetails) => {
          this.videos = [...this.videos, ...videoDetails.videos];
          this.loading = false;
        });
    }
  }

  onScroll(event: any) {
    const condition: boolean =
      event.target.offsetHeight + event.target.scrollTop + 2 >=
      event.target.scrollHeight;

    if (condition && !this.loading && !this.noVideos) {
      this.loadMore();
    }
  }
}
