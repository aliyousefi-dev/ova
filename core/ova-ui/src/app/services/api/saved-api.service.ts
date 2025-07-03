import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface SavedResponse {
  username: string;
  saved: string[]; // array of video IDs (strings)
}

@Injectable({
  providedIn: 'root',
})
export class SavedApiService {
  private baseUrl = environment.apiBaseUrl;

  private httpOptions = { withCredentials: true };

  constructor(private http: HttpClient) {}

  getUserSaved(username: string): Observable<SavedResponse> {
    return this.http
      .get<{ data: SavedResponse }>(
        `${this.baseUrl}/users/${username}/saved`,
        this.httpOptions
      )
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  addUserSaved(
    username: string,
    videoId: string
  ): Observable<{ username: string; videoId: string }> {
    return this.http
      .post<{ data: { username: string; videoId: string } }>(
        `${this.baseUrl}/users/${username}/saved/${videoId}`,
        {}, // empty body
        this.httpOptions
      )
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  removeUserSaved(
    username: string,
    videoId: string
  ): Observable<{ username: string; videoId: string }> {
    return this.http
      .delete<{ data: { username: string; videoId: string } }>(
        `${this.baseUrl}/users/${username}/saved/${videoId}`,
        this.httpOptions
      )
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Saved API error:', error);
    return throwError(
      () => new Error(error.error?.message || 'Saved API error')
    );
  }
}
