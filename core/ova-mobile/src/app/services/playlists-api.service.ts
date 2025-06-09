import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

import {
  PlaylistData,
  PlaylistDataResponse,
} from '../data-types/playlist-data';

import { ApiResponse } from '../data-types/responses';
import { ServerConfigService } from './server-config.service';

@Injectable({
  providedIn: 'root',
})
export class PlaylistsApiService {
  constructor(
    private http: HttpClient,
    private serverConfig: ServerConfigService
  ) {}

  private getBaseUrl(): string {
    const url = this.serverConfig.getServerUrl();
    if (!url) {
      throw new Error('Server URL is not set');
    }
    return url;
  }

  getUserPlaylists(
    username: string
  ): Observable<ApiResponse<PlaylistDataResponse>> {
    return this.http.get<ApiResponse<PlaylistDataResponse>>(
      `${this.getBaseUrl()}/users/${username}/playlists`,
      { withCredentials: true }
    );
  }

  createUserPlaylist(
    username: string,
    playlist: { title: string; description?: string; videoIds: string[] }
  ): Observable<ApiResponse<PlaylistData>> {
    return this.http
      .post<ApiResponse<PlaylistData>>(
        `${this.getBaseUrl()}/users/${username}/playlists`,
        playlist,
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

  getUserPlaylistBySlug(
    username: string,
    slug: string
  ): Observable<ApiResponse<PlaylistData>> {
    return this.http.get<ApiResponse<PlaylistData>>(
      `${this.getBaseUrl()}/users/${username}/playlists/${slug}`,
      { withCredentials: true }
    );
  }

  deleteUserPlaylistBySlug(
    username: string,
    slug: string
  ): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.getBaseUrl()}/users/${username}/playlists/${slug}`,
      { withCredentials: true }
    );
  }

  addVideoToPlaylist(
    username: string,
    slug: string,
    videoId: string
  ): Observable<ApiResponse<PlaylistData>> {
    return this.http.post<ApiResponse<PlaylistData>>(
      `${this.getBaseUrl()}/users/${username}/playlists/${slug}/videos`,
      { videoId },
      { withCredentials: true }
    );
  }

  deleteVideoFromPlaylist(
    username: string,
    slug: string,
    videoId: string
  ): Observable<ApiResponse<PlaylistData>> {
    return this.http.delete<ApiResponse<PlaylistData>>(
      `${this.getBaseUrl()}/users/${username}/playlists/${slug}/videos/${videoId}`,
      { withCredentials: true }
    );
  }
}
