import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VideoData } from '../data-types/video-data.model';
import { map } from 'rxjs/operators';

interface FavoritesResponse {
  username: string;
  favorites: string[];
}

interface AuthStatusResponse {
  authenticated: boolean;
  username?: string;
}

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
    return this.http
      .get<{ status: string; data: AuthStatusResponse; message: string }>(
        `${this.baseUrl}/auth/status`
      )
      .pipe(
        map((response) => response.data) // unwrap the data property
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
}
