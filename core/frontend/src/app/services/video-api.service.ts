import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { VideoData } from '../data-types/video-data';
import { ApiResponse } from '../data-types/responses';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VideoApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getFolderLists(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(
      `${this.baseUrl}/folders`,
      { withCredentials: true } // ✅ Add this
    );
  }

  getVideosByFolder(folder: string): Observable<ApiResponse<VideoData[]>> {
    return this.http.get<ApiResponse<VideoData[]>>(
      `${this.baseUrl}/videos?folder=${encodeURIComponent(folder)}`,
      { withCredentials: true } // ✅ Add this
    );
  }

  getVideoById(videoId: string): Observable<ApiResponse<VideoData>> {
    return this.http.get<ApiResponse<VideoData>>(
      `${this.baseUrl}/videos/${videoId}`,
      { withCredentials: true } // ✅ Add this
    );
  }

  getVideosByIds(ids: string[]): Observable<ApiResponse<VideoData[]>> {
    return this.http.post<ApiResponse<VideoData[]>>(
      `${this.baseUrl}/videos/batch`,
      { ids },
      { withCredentials: true } // ✅ Add this
    );
  }

  getStreamUrl(videoId: string): string {
    return `${this.baseUrl}/stream/${videoId}`; // Usually used directly in <video> src
  }

  getDownloadUrl(videoId: string): string {
    return `${this.baseUrl}/download/${videoId}`;
  }

  getThumbnailUrl(videoId: string): string {
    return `${this.baseUrl}/thumbnail/${videoId}`;
  }

  getPreviewUrl(videoId: string): string {
    return `${this.baseUrl}/preview/${videoId}`;
  }
}
