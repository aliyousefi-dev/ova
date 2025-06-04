import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { VideoData } from '../data-types/video-data';
import { ApiResponse } from '../data-types/responses';

@Injectable({
  providedIn: 'root',
})
export class VideoApiService {
  private baseUrl = '/api/v1';

  constructor(private http: HttpClient) {}

  getFolderLists(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.baseUrl}/folders`);
  }

  getVideosByFolder(folder: string): Observable<ApiResponse<VideoData[]>> {
    return this.http.get<ApiResponse<VideoData[]>>(
      `${this.baseUrl}/videos?folder=${encodeURIComponent(folder)}`
    );
  }

  getVideoById(videoId: string): Observable<ApiResponse<VideoData>> {
    return this.http.get<ApiResponse<VideoData>>(
      `${this.baseUrl}/videos/${videoId}`
    );
  }

  getVideosByIds(ids: string[]): Observable<ApiResponse<VideoData[]>> {
    return this.http.post<ApiResponse<VideoData[]>>(
      `${this.baseUrl}/videos/batch`,
      { ids }
    );
  }

  getStreamUrl(videoId: string): string {
    return `${this.baseUrl}/stream/${videoId}`;
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
