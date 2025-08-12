// marker-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from './response-type';

// This interface defines the shape of the marker data as the Angular frontend expects it,
// matching the 'VideoMarker' struct in the Go API, using hour, minute, and second.
export interface VideoMarker {
  hour: number;
  minute: number;
  second: number;
  title: string;
}

@Injectable({
  providedIn: 'root',
})
export class MarkerApiService {
  // Ensure baseUrl is safely initialized with a fallback.
  // In a typical Angular setup, environment.apiBaseUrl will be defined.
  private baseUrl = environment.apiBaseUrl || '/api';

  constructor(private http: HttpClient) {}

  getMarkerFileUrl(videoId: string): string {
    return `${this.baseUrl}/video/markers/${videoId}/file`;
  }

  getMarkers(
    videoId: string
  ): Observable<ApiResponse<{ markers: VideoMarker[] }>> {
    // The Go API will now send back markers with 'hour', 'minute', 'second' fields.
    return this.http.get<ApiResponse<{ markers: VideoMarker[] }>>(
      `${this.baseUrl}/video/markers/${videoId}`,
      { withCredentials: true }
    );
  }

  updateMarkers(
    videoId: string,
    markers: VideoMarker[]
  ): Observable<ApiResponse<any>> {
    // The Go API will receive this array of markers with hour, minute, second.
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/video/markers/${videoId}`,
      { markers },
      { withCredentials: true }
    );
  }

  deleteAllMarkers(videoId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.baseUrl}/video/markers/${videoId}`,
      { withCredentials: true }
    );
  }

  deleteMarker(
    videoId: string,
    markerToDelete: { hour: number; minute: number; second: number }
  ): Observable<ApiResponse<any>> {
    // The hour, minute, and second are passed as part of the URL,
    // reflecting the updated Go API route.
    return this.http.delete<ApiResponse<any>>(
      `${this.baseUrl}/video/markers/${videoId}/${markerToDelete.hour}/${markerToDelete.minute}/${markerToDelete.second}`,
      { withCredentials: true }
    );
  }
}
