import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

import { PlaylistData, PlaylistDataResponse } from './api-types';

import { ApiResponse } from './api-types';

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
            (a, b) => (a.Order ?? 0) - (b.Order ?? 0)
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

  getUserPlaylistBySlug(
    username: string,
    slug: string
  ): Observable<ApiResponse<PlaylistData>> {
    return this.http.get<ApiResponse<PlaylistData>>(
      `${this.baseUrl}/users/${username}/playlists/${slug}`,
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

  setPlaylistsOrder(
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
