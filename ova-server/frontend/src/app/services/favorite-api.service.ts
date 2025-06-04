import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FavoritesResponse } from '../data-types/responses';
import { ApiResponse } from '../data-types/responses';

@Injectable({
  providedIn: 'root',
})
export class FavoriteApiService {
  private baseUrl = '/api/v1';

  constructor(private http: HttpClient) {}

  getUserFavorites(username: string): Observable<FavoritesResponse> {
    return this.http
      .get<ApiResponse<FavoritesResponse>>(
        `${this.baseUrl}/users/${username}/favorites`
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
        { favorites }
      )
      .pipe(map((response) => response.data));
  }
}
