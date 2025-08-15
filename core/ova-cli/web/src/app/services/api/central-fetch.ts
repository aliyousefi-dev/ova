import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

import { VideoData } from '../../data-types/video-data';

import { LatestVideosService } from './latest-api.service';
import { VideoApiService } from './video-api.service';

@Injectable({
  providedIn: 'root',
})
export class CentralFetchService {
  constructor(
    private latestVideosService: LatestVideosService,
    private videoApiService: VideoApiService
  ) {}

  // Fetch the gallery data using LatestVideosService and switch based on route
  fetchGallery(
    route: string = 'recent', // Default route is 'recent'
    bucket: number = 1 // Default bucket is 1
  ): Observable<VideoData[]> {
    switch (route) {
      case 'recent': {
        // Use LatestVideosService to fetch the latest videos for the given bucket
        return this.latestVideosService.getLatestVideos(bucket).pipe(
          switchMap((response) => {
            const videoIds = response.data.videoIds;
            // Fetch video details using VideoApiService
            return this.videoApiService
              .getVideosByIds(videoIds)
              .pipe(map((videoDetails) => videoDetails.data));
          })
        );
      }

      // Add more routes as needed
      default: {
        // You can return an empty array or handle an unknown route
        return new Observable<VideoData[]>(); // Empty observable for unknown routes
      }
    }
  }
}
