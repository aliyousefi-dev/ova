import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiResponse } from './response-type';

import { environment } from '../../../environments/environment';

export interface WatchedResponse {
  videoIds: string[]; // Array of video IDs
  totalVideos: number; // Total number of videos cached
  currentBucket: number; // The current bucket requested
  bucketContentSize: number; // Size of each bucket (fixed to 20)
  totalBuckets: number; // Total number of buckets
}

@Injectable({
  providedIn: 'root',
})
export class WatchedApiService {
  private baseUrl = environment.apiBaseUrl;
  private httpOptions = { withCredentials: true };

  constructor(private http: HttpClient) {}

  getUserWatched(
    username: string,
    bucket: number = 1
  ): Observable<ApiResponse<WatchedResponse>> {
    // Use ApiResponse wrapper
    return this.http
      .get<ApiResponse<WatchedResponse>>(
        `${this.baseUrl}/users/${username}/watched?bucket=${bucket}`,
        this.httpOptions
      )
      .pipe(catchError(this.handleError)); // Handle errors as before
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
