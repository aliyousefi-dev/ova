import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { PlaylistData } from '../../data-types/playlist-data';

import { ApiResponse } from './response-type';

export interface PlaylistSummary {
  title: string;
  description?: string;
  headVideoId: string;
  totalVideos: number;
  slug: string;
  order: number;
}

export interface PlaylistDataResponse {
  playlists: PlaylistSummary[];
  totalPlaylists: number;
  username: string;
}

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
export class PlaylistAPIService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getUserPlaylists(
    username: string
  ): Observable<ApiResponse<PlaylistDataResponse>> {
    return this.http
      .get<ApiResponse<PlaylistDataResponse>>(
        `${this.baseUrl}/users/${username}/playlists`,
        { withCredentials: true }
      )
      .pipe(
        map((response) => {
          response.data.playlists = [...response.data.playlists].sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0)
          );
          return response;
        })
      );
  }

  createUserPlaylist(
    username: string,
    playlist: { title: string; description?: string; videoIds: string[] }
  ): Observable<ApiResponse<PlaylistData>> {
    return this.http
      .post<ApiResponse<PlaylistData>>(
        `${this.baseUrl}/users/${username}/playlists`,
        playlist,
        { withCredentials: true } // ✅ important
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          let userFriendlyError = 'An unknown error occurred';
          if (
            error.error &&
            error.error.status === 'error' &&
            error.error.error?.message
          ) {
            userFriendlyError = error.error.error.message;
          }
          return throwError(() => new Error(userFriendlyError));
        })
      );
  }

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

  deleteUserPlaylistBySlug(
    username: string,
    slug: string
  ): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.baseUrl}/users/${username}/playlists/${slug}`,
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

  savePlaylistsOrder(
    username: string,
    order: string[]
  ): Observable<ApiResponse<null>> {
    return this.http
      .put<ApiResponse<null>>(
        `${this.baseUrl}/users/${username}/playlists/order`,
        { order },
        { withCredentials: true }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          let userFriendlyError = 'An unknown error occurred';
          if (
            error.error &&
            error.error.status === 'error' &&
            error.error.error?.message
          ) {
            userFriendlyError = error.error.error.message;
          }
          return throwError(() => new Error(userFriendlyError));
        })
      );
  }

  updateUserPlaylistInfo(
    username: string,
    slug: string,
    update: { title?: string; description?: string }
  ): Observable<ApiResponse<PlaylistData>> {
    return this.http
      .put<ApiResponse<PlaylistData>>(
        `${this.baseUrl}/users/${username}/playlists/${slug}`,
        update,
        { withCredentials: true }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          let userFriendlyError = 'An unknown error occurred';
          if (
            error.error &&
            error.error.status === 'error' &&
            error.error.error?.message
          ) {
            userFriendlyError = error.error.error.message;
          }
          return throwError(() => new Error(userFriendlyError));
        })
      );
  }
}
