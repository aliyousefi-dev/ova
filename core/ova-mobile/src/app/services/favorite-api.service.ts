import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FavoritesResponse, ApiResponse } from '../data-types/responses';
import { ServerConfigService } from './server-config.service';

@Injectable({
  providedIn: 'root',
})
export class FavoriteApiService {
  constructor(
    private http: HttpClient,
    private serverConfig: ServerConfigService
  ) {}

  private getBaseUrl(): string {
    const url = localStorage.getItem('server_url') || null;
    if (!url) {
      throw new Error('VideoAPI - Server URL is not set');
    }
    return url;
  }

  getUserFavorites(username: string): Observable<FavoritesResponse> {
    return this.http
      .get<ApiResponse<FavoritesResponse>>(
        `${this.getBaseUrl()}/users/${username}/favorites`,
        { withCredentials: true }
      )
      .pipe(map((response) => response.data));
  }

  updateUserFavorites(
    username: string,
    favorites: string[]
  ): Observable<FavoritesResponse> {
    return this.http
      .post<ApiResponse<FavoritesResponse>>(
        `${this.getBaseUrl()}/users/${username}/favorites`,
        { favorites },
        { withCredentials: true }
      )
      .pipe(map((response) => response.data));
  }
}
