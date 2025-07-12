import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { VideoData } from './api-types';

export interface WatchedResponse {
  username: string;
  data: VideoData[]; // The backend returns a JSON array of VideoData as the "data" field
}

@Injectable({
  providedIn: 'root',
})
export class WatchedApiService {
  private baseUrl = environment.apiBaseUrl;
  private httpOptions = { withCredentials: true };

  constructor(private http: HttpClient) {}

  /**
   * Get watched videos list for a user.
   * @param username The username for whom to fetch watched videos.
   * @returns An Observable of an array of VideoData.
   */
  getUserWatched(username: string): Observable<VideoData[]> {
    return this.http
      .get<{ data: VideoData[] }>(
        `${this.baseUrl}/users/${username}/watched`,
        this.httpOptions
      )
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Mark a video as watched for a specific user.
   * @param username The username for whom to mark the video as watched.
   * @param videoId The ID of the video to mark as watched.
   * @returns An Observable with a success message.
   */
  addUserWatched(
    username: string,
    videoId: string
  ): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(
        `${this.baseUrl}/users/${username}/watched`,
        { videoId },
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Clears the entire watched history for a specific user.
   * @param username The username whose watched history is to be cleared.
   * @returns An Observable with a success message.
   */
  clearUserWatched(username: string): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(
        `${this.baseUrl}/users/${username}/watched`, // This maps to your DELETE /users/:username/watched endpoint
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Watched API error:', error);
    return throwError(
      () => new Error(error.error?.message || 'Watched API error')
    );
  }
}
