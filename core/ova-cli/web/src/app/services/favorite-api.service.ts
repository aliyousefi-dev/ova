import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';

export interface FavoritesResponse {
  username: string;
  favorites: string[]; // array of video IDs (strings)
}

@Injectable({
  providedIn: 'root',
})
export class FavoriteApiService {
  private baseUrl = environment.apiBaseUrl;

  private httpOptions = { withCredentials: true };

  constructor(private http: HttpClient) {}

  getUserFavorites(username: string): Observable<FavoritesResponse> {
    return this.http
      .get<{ data: FavoritesResponse }>(
        `${this.baseUrl}/users/${username}/favorites`,
        this.httpOptions
      )
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  addUserFavorite(
    username: string,
    videoId: string
  ): Observable<{ username: string; videoId: string }> {
    return this.http
      .post<{ data: { username: string; videoId: string } }>(
        `${this.baseUrl}/users/${username}/favorites/${videoId}`,
        {}, // empty body
        this.httpOptions
      )
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  removeUserFavorite(
    username: string,
    videoId: string
  ): Observable<{ username: string; videoId: string }> {
    return this.http
      .delete<{ data: { username: string; videoId: string } }>(
        `${this.baseUrl}/users/${username}/favorites/${videoId}`,
        this.httpOptions
      )
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Favorite API error:', error);
    return throwError(
      () => new Error(error.error?.message || 'Favorite API error')
    );
  }
}
