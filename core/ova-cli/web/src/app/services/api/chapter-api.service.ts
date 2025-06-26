import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../data-types/responses';

export interface VideoMarker {
  timestamp: number; // seconds from video start, e.g. 0, 60.5
  title: string;
}

@Injectable({
  providedIn: 'root',
})
export class MarkerApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getMarkerFileUrl(videoId: string): string {
    return `${this.baseUrl}/video/markers/${videoId}/file`;
  }

  getMarkers(
    videoId: string
  ): Observable<ApiResponse<{ markers: VideoMarker[] }>> {
    return this.http.get<ApiResponse<{ markers: VideoMarker[] }>>(
      `${this.baseUrl}/video/markers/${videoId}`,
      { withCredentials: true }
    );
  }

  updateMarkers(
    videoId: string,
    markers: VideoMarker[]
  ): Observable<ApiResponse<any>> {
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
    timestamp: number
  ): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.baseUrl}/video/markers/${videoId}/${timestamp}`,
      { withCredentials: true }
    );
  }
}
