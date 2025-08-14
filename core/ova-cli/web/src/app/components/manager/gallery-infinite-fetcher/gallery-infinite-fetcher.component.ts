import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { GalleryViewComponent } from '../../containers/gallery-view/gallery-view.component';
import { LatestVideosService } from '../../../services/api/latest-api.service';
import { VideoApiService } from '../../../services/api/video-api.service';
import { VideoData } from '../../../data-types/video-data';
import { Input } from '@angular/core';

@Component({
  selector: 'app-gallery-infinite-fetcher',
  standalone: true,
  imports: [CommonModule, RouterModule, GalleryViewComponent],
  templateUrl: './gallery-infinite-fetcher.component.html',
})
export class GalleryInfiniteFetcher implements OnInit {
  @Input() isMiniView: boolean = false;
  @Input() PreviewPlayback: boolean = false;

  videos: VideoData[] = [];
  CurrentBucket: number = 1;
  TotalBuckets: number = 1;
  TotalVideos: number = 0;
  loading: boolean = false;

  @ViewChild('scrollContainer') scrollContainer: any;

  ngOnInit(): void {
    this.initialLoad();
  }

  constructor(
    private latestVideosService: LatestVideosService,
    private videoApiService: VideoApiService
  ) {}

  initialLoad() {
    this.videos = [];
    this.loading = true;

    this.latestVideosService.getLatestVideos(1).subscribe((videos) => {
      this.CurrentBucket = videos.data.currentBucket;
      this.TotalBuckets = videos.data.totalBuckets;
      this.TotalVideos = videos.data.totalVideos;

      this.videoApiService
        .getVideosByIds(videos.data.videoIds)
        .subscribe((videoDetails) => {
          this.videos = videoDetails.data;
          this.loading = false;
        });
    });
  }

  loadMore() {
    if (this.CurrentBucket < this.TotalBuckets && !this.loading) {
      this.loading = true;
      this.CurrentBucket++;

      this.latestVideosService
        .getLatestVideos(this.CurrentBucket)
        .subscribe((videos) => {
          this.videoApiService
            .getVideosByIds(videos.data.videoIds)
            .subscribe((videoDetails) => {
              this.videos = [...this.videos, ...videoDetails.data];
              this.loading = false;
            });
        });
    }
  }

  onScroll(event: any) {
    console.log(event.target.scrollHeight);

    // Calculate if we have scrolled to the bottom
    const condition: boolean =
      event.target.offsetHeight + event.target.scrollTop + 2 >=
      event.target.scrollHeight;

    if (condition && !this.loading) {
      this.loadMore();
    }
  }
}
