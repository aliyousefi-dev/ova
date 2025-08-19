import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { PlaylistData } from '../../data-types/playlist-data';

import { ApiResponse } from './response-type';

export interface PlaylistContentResponse {
  username: string; // The username of the user
  slug: string; // The slug of the playlist
  videoIds: string[]; // Array of video IDs
  totalVideos: number; // Total number of videos cached
  currentBucket: number; // The current bucket requested
  bucketContentSize: number; // Size of each bucket (fixed to 20)
  totalBuckets: number; // Total number of buckets
}

@Injectable({
  providedIn: 'root',
})
export class PlaylistContentAPIService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  fetchPlaylistContent(
    username: string,
    slug: string,
    bucket: number = 1
  ): Observable<ApiResponse<PlaylistContentResponse>> {
    return this.http.get<ApiResponse<PlaylistContentResponse>>(
      `${this.baseUrl}/users/${username}/playlists/${slug}?bucket=${bucket}`,
      { withCredentials: true } // ✅ important
    );
  }

  addVideoToPlaylist(
    username: string,
    slug: string,
    videoId: string
  ): Observable<ApiResponse<PlaylistData>> {
    return this.http.post<ApiResponse<PlaylistData>>(
      `${this.baseUrl}/users/${username}/playlists/${slug}/videos`,
      { videoId },
      { withCredentials: true } // ✅ important
    );
  }

  deleteVideoFromPlaylist(
    username: string,
    slug: string,
    videoId: string
  ): Observable<ApiResponse<PlaylistData>> {
    return this.http.delete<ApiResponse<PlaylistData>>(
      `${this.baseUrl}/users/${username}/playlists/${slug}/videos/${videoId}`,
      { withCredentials: true } // ✅ important
    );
  }
}
