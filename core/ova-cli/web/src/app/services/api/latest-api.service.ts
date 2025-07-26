import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../data-types/responses'; // Assuming this interface is correct

import { environment } from '../../../environments/environment'; // Assuming your environment setup is correct

export interface LatestVideosResponse {
  videoIds: string[]; // Array of video IDs
  totalVideos: number; // Total number of videos cached
}

@Injectable({
  providedIn: 'root',
})
export class LatestVideosService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Fetch the latest videos in the specified range [start, end] (inclusive, 0-based)
  getLatestVideos(
    start: number = 0, // This is the 0-based starting index
    end: number = 19 // This is the 0-based inclusive ending index
  ): Observable<ApiResponse<LatestVideosResponse>> {
    // Construct the URL with start and end query parameters
    const url = `${this.baseUrl}/videos/latest?start=${start}&end=${end}`;
    console.log(`[LatestVideosService] Requesting URL: ${url}`); // Log the exact URL being requested
    return this.http.get<ApiResponse<LatestVideosResponse>>(url);
  }
}
