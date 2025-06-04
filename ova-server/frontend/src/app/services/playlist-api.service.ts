import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../data-types/responses';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';

import {
  PlaylistData,
  PlaylistDataResponse,
} from '../data-types/playlist-data';

@Injectable({
  providedIn: 'root',
})
export class PlaylistAPIService {
  private baseUrl = '/api/v1'; // same-origin, relative path

  constructor(private http: HttpClient) {}

  getUserPlaylists(
    username: string
  ): Observable<ApiResponse<PlaylistDataResponse>> {
    return this.http.get<ApiResponse<PlaylistDataResponse>>(
      `${this.baseUrl}/users/${username}/playlists`
    );
  }

  createUserPlaylist(
    username: string,
    playlist: { title: string; description?: string; videoIds: string[] }
  ): Observable<ApiResponse<PlaylistData>> {
    return this.http
      .post<ApiResponse<PlaylistData>>(
        `${this.baseUrl}/users/${username}/playlists`,
        playlist
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          // Here, parse your error JSON and throw a user-friendly error object
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

  getUserPlaylistBySlug(
    username: string,
    slug: string
  ): Observable<ApiResponse<PlaylistData>> {
    return this.http.get<ApiResponse<PlaylistData>>(
      `${this.baseUrl}/users/${username}/playlists/${slug}`
    );
  }

  deleteUserPlaylistBySlug(
    username: string,
    slug: string
  ): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.baseUrl}/users/${username}/playlists/${slug}`
    );
  }

  addVideoToPlaylist(
    username: string,
    slug: string,
    videoId: string
  ): Observable<ApiResponse<PlaylistData>> {
    return this.http.post<ApiResponse<PlaylistData>>(
      `${this.baseUrl}/users/${username}/playlists/${slug}/videos`,
      { videoId }
    );
  }

  deleteVideoFromPlaylist(
    username: string,
    slug: string,
    videoId: string
  ): Observable<ApiResponse<PlaylistData>> {
    return this.http.delete<ApiResponse<PlaylistData>>(
      `${this.baseUrl}/users/${username}/playlists/${slug}/videos/${videoId}`
    );
  }
}
