import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { VideoData } from '../data-types/video-data';
import { AuthStatusResponse } from '../data-types/responses';
import { FavoritesResponse } from '../data-types/responses';
import { PlaylistData } from '../data-types/playlist-data';
import { PlaylistResponse } from '../data-types/responses';
import { ApiResponse } from '../data-types/responses';
import { SearchResponse } from '../data-types/responses';

@Injectable({
  providedIn: 'root',
})
export class APIService {
  private baseUrl = '/api/v1'; // same-origin, relative path

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post<{
      data: { sessionId: string };
      message: string;
      status: string;
    }>(`${this.baseUrl}/auth/login`, { username, password });
  }

  logout() {
    return this.http.post<{ message: string; status: string }>(
      `${this.baseUrl}/auth/logout`,
      null
    );
  }

  checkAuth(): Observable<AuthStatusResponse> {
    return this.getAuthStatusFull().pipe(map((res) => res.data));
  }

  getAuthStatusFull(): Observable<ApiResponse<AuthStatusResponse>> {
    return this.http.get<ApiResponse<AuthStatusResponse>>(
      `${this.baseUrl}/auth/status`
    );
  }

  getFolders(): Observable<any> {
    return this.http.get(`${this.baseUrl}/folders`);
  }

  getVideos(folder: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/videos?folder=${encodeURIComponent(folder)}`
    );
  }

  getVideoById(videoId: string): Observable<{ data: VideoData }> {
    return this.http.get<{ data: VideoData }>(
      `${this.baseUrl}/videos/${videoId}`
    );
  }

  getStreamUrl(videoId: string): string {
    return `${this.baseUrl}/stream/${videoId}`;
  }

  getDownloadUrl(videoId: string): string {
    return `${this.baseUrl}/download/${videoId}`;
  }

  getThumbnailUrl(videoId: string): string {
    return `${this.baseUrl}/thumbnail/${videoId}`;
  }

  getPreviewUrl(videoId: string): string {
    return `${this.baseUrl}/preview/${videoId}`;
  }

  getUserFavorites(username: string): Observable<FavoritesResponse> {
    return this.http
      .get<{ data: FavoritesResponse; message: string; status: string }>(
        `${this.baseUrl}/users/${username}/favorites`
      )
      .pipe(map((response) => response.data));
  }

  updateUserFavorites(
    username: string,
    favorites: string[]
  ): Observable<FavoritesResponse> {
    return this.http
      .post<{ data: FavoritesResponse; message: string; status: string }>(
        `${this.baseUrl}/users/${username}/favorites`,
        { favorites }
      )
      .pipe(map((response) => response.data));
  }

  // Playlists

  // Get all playlists for a user
  getUserPlaylists(username: string): Observable<PlaylistData[]> {
    return this.http
      .get<PlaylistResponse>(`${this.baseUrl}/users/${username}/playlists`)
      .pipe(map((res) => (res.data as any).playlists || []));
  }

  // Create a new playlist for a user
  createUserPlaylist(
    username: string,
    playlist: { title: string; description?: string; videoIds: string[] }
  ): Observable<PlaylistData> {
    return this.http
      .post<PlaylistResponse>(
        `${this.baseUrl}/users/${username}/playlists`,
        playlist
      )
      .pipe(map((res) => res.data as PlaylistData));
  }

  // Get playlist by slug for a user
  getUserPlaylistBySlug(
    username: string,
    slug: string
  ): Observable<PlaylistData> {
    return this.http
      .get<PlaylistResponse>(
        `${this.baseUrl}/users/${username}/playlists/${slug}`
      )
      .pipe(map((res) => res.data as PlaylistData));
  }

  // Delete playlist by slug for a user
  deleteUserPlaylistBySlug(username: string, slug: string): Observable<void> {
    return this.http
      .delete<PlaylistResponse>(
        `${this.baseUrl}/users/${username}/playlists/${slug}`
      )
      .pipe(map(() => void 0));
  }

  // Add a video to a playlist
  addVideoToPlaylist(
    username: string,
    slug: string,
    videoId: string
  ): Observable<PlaylistData> {
    console.log(`${this.baseUrl}/users/${username}/playlists/${slug}/videos`);
    return this.http
      .post<PlaylistResponse>(
        `${this.baseUrl}/users/${username}/playlists/${slug}/videos`,
        { videoId }
      )
      .pipe(map((res) => res.data as PlaylistData));
  }

  // Remove a video from a playlist
  deleteVideoFromPlaylist(
    username: string,
    slug: string,
    videoId: string
  ): Observable<PlaylistData> {
    return this.http
      .delete<PlaylistResponse>(
        `${this.baseUrl}/users/${username}/playlists/${slug}/videos/${videoId}`
      )
      .pipe(map((res) => res.data as PlaylistData));
  }

  getVideosByIds(ids: string[]): Observable<ApiResponse<VideoData[]>> {
    return this.http.post<ApiResponse<VideoData[]>>('/api/v1/videos/batch', {
      ids,
    });
  }

  searchVideos(query: string): Observable<ApiResponse<SearchResponse>> {
    return this.http.post<ApiResponse<SearchResponse>>(
      `${this.baseUrl}/search`,
      {
        query,
      }
    );
  }
}
