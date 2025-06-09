import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FavoritesResponse } from '../data-types/responses';
import { ApiResponse } from '../data-types/responses';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FavoriteApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getUserFavorites(username: string): Observable<FavoritesResponse> {
    return this.http
      .get<ApiResponse<FavoritesResponse>>(
        `${this.baseUrl}/users/${username}/favorites`,
        { withCredentials: true } // ✅ required for session cookie
      )
      .pipe(map((response) => response.data));
  }

  updateUserFavorites(
    username: string,
    favorites: string[]
  ): Observable<FavoritesResponse> {
    return this.http
      .post<ApiResponse<FavoritesResponse>>(
        `${this.baseUrl}/users/${username}/favorites`,
        { favorites },
        { withCredentials: true } // ✅ required for session cookie
      )
      .pipe(map((response) => response.data));
  }
}
