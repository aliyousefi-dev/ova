import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

import { VideoData } from '../../data-types/video-data';

import { LatestVideosService } from './latest-api.service';
import { VideoApiService } from './video-api.service';
import { WatchedApiService } from './watched-api.service';
import { SavedApiService } from './saved-api.service';
import { PlaylistContentAPIService } from './playlist-content-api.service';
import { UtilsService } from '../utils.service';

export interface GalleryResponse {
  videos: VideoData[]; // Array of video data
  totalVideos: number; // Total number of videos cached
  currentBucket: number; // The current bucket requested
  bucketContentSize: number; // Size of each bucket (fixed to 20)
  totalBuckets: number; // Total number of buckets
}

@Injectable({
  providedIn: 'root',
})
export class CentralFetchService {
  constructor(
    private latestVideosService: LatestVideosService,
    private videoApiService: VideoApiService,
    private watchedApiService: WatchedApiService,
    private savedApiService: SavedApiService,
    private playlistContentAPIService: PlaylistContentAPIService,
    private utilsService: UtilsService
  ) {}

  // Fetch the gallery data using LatestVideosService and switch based on route
  fetchGallery(
    route: string = 'recent', // Default route is 'recent'
    bucket: number = 1, // Default bucket is 1
    slug?: string // Optional slug for playlists
  ): Observable<GalleryResponse> {
    switch (route) {
      case 'recent': {
        // Use LatestVideosService to fetch the latest videos for the given bucket
        return this.latestVideosService.getLatestVideos(bucket).pipe(
          switchMap((response) => {
            const videoIds = response.data.videoIds;
            const totalVideos = response.data.totalVideos;
            const currentBucket = response.data.currentBucket;
            const bucketContentSize = response.data.bucketContentSize;
            const totalBuckets = response.data.totalBuckets;

            // Fetch video details using VideoApiService
            return this.videoApiService.getVideosByIds(videoIds).pipe(
              map((videoDetails) => {
                const videos: VideoData[] = videoDetails.data;
                // Construct and return the final GalleryResponse
                return {
                  videos: videos,
                  totalVideos: totalVideos,
                  currentBucket: currentBucket,
                  bucketContentSize: bucketContentSize,
                  totalBuckets: totalBuckets,
                };
              })
            );
          })
        );
      }

      case 'watched': {
        const username: string = this.utilsService.getUsername() || '';

        // Use WatchedApiService to fetch the watched videos for the given bucket
        return this.watchedApiService.getUserWatched(username, bucket).pipe(
          switchMap((response) => {
            const videoIds = response.data.videoIds;
            const totalVideos = response.data.totalVideos;
            const currentBucket = response.data.currentBucket;
            const bucketContentSize = response.data.bucketContentSize;
            const totalBuckets = response.data.totalBuckets;

            // Fetch video details using VideoApiService
            return this.videoApiService.getVideosByIds(videoIds).pipe(
              map((videoDetails) => {
                const videos: VideoData[] = videoDetails.data;
                // Construct and return the final GalleryResponse
                return {
                  videos: videos,
                  totalVideos: totalVideos,
                  currentBucket: currentBucket,
                  bucketContentSize: bucketContentSize,
                  totalBuckets: totalBuckets,
                };
              })
            );
          })
        );
      }

      case 'saved': {
        const username: string = this.utilsService.getUsername() || '';

        // Use SavedApiService to fetch the saved videos for the given bucket
        return this.savedApiService.getUserSaved(username, bucket).pipe(
          switchMap((response) => {
            const savedVideoIds = response.data.videoIds;
            const totalVideos = response.data.totalVideos;
            const currentBucket = response.data.currentBucket;
            const bucketContentSize = response.data.bucketContentSize;
            const totalBuckets = response.data.totalBuckets;

            // Fetch video details using VideoApiService
            return this.videoApiService.getVideosByIds(savedVideoIds).pipe(
              map((videoDetails) => {
                const videos: VideoData[] = videoDetails.data;
                // Construct and return the final GalleryResponse
                return {
                  videos: videos,
                  totalVideos: totalVideos,
                  currentBucket: currentBucket,
                  bucketContentSize: bucketContentSize,
                  totalBuckets: totalBuckets,
                };
              })
            );
          })
        );
      }

      case 'playlist-content': {
        const username: string = this.utilsService.getUsername() || '';

        // Ensure we have the slug for the playlist route
        if (!slug) {
          throw new Error('Slug is required for playlist fetching');
        }

        // Use PlaylistContentAPIService to fetch the playlist contents for the given user and slug
        return this.playlistContentAPIService
          .fetchPlaylistContent(username, slug, bucket) // Pass the slug here
          .pipe(
            switchMap((response) => {
              const savedVideoIds = response.data.videoIds;
              const totalVideos = response.data.totalVideos;
              const currentBucket = response.data.currentBucket;
              const bucketContentSize = response.data.bucketContentSize;
              const totalBuckets = response.data.totalBuckets;

              // Fetch video details using VideoApiService
              return this.videoApiService.getVideosByIds(savedVideoIds).pipe(
                map((videoDetails) => {
                  const videos: VideoData[] = videoDetails.data;
                  // Construct and return the final GalleryResponse
                  return {
                    videos: videos,
                    totalVideos: totalVideos,
                    currentBucket: currentBucket,
                    bucketContentSize: bucketContentSize,
                    totalBuckets: totalBuckets,
                  };
                })
              );
            })
          );
      }

      // You can add more routes like 'favorites' or others as needed
      default: {
        return new Observable<GalleryResponse>(); // Return an empty observable for unknown routes
      }
    }
  }
}
