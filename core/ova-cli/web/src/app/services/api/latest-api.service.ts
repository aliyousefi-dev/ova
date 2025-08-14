import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from './response-type';

import { environment } from '../../../environments/environment'; // Assuming your environment setup is correct

export interface LatestVideosResponse {
  videoIds: string[]; // Array of video IDs
  totalVideos: number; // Total number of videos cached
  currentBucket: number; // The current bucket requested
  bucketContentSize: number; // Size of each bucket (fixed to 20)
  totalBuckets: number; // Total number of buckets
}

@Injectable({
  providedIn: 'root',
})
export class LatestVideosService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Fetch the latest videos based on the specified bucket
  getLatestVideos(
    bucket: number = 1
  ): Observable<ApiResponse<LatestVideosResponse>> {
    // Construct the URL with bucket query parameter
    const url = `${this.baseUrl}/videos/latest?bucket=${bucket}`;
    console.log(`[LatestVideosService] Requesting URL: ${url}`); // Log the exact URL being requested
    return this.http.get<ApiResponse<LatestVideosResponse>>(url);
  }
}
