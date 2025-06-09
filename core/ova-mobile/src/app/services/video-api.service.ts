import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { VideoData } from '../data-types/video-data';
import { ApiResponse } from '../data-types/responses';
import { ServerConfigService } from './server-config.service';

@Injectable({
  providedIn: 'root',
})
export class VideoApiService {
  constructor(
    private http: HttpClient,
    private serverConfig: ServerConfigService
  ) {}

  private getBaseUrl(): string {
    const url = this.serverConfig.getServerUrl();
    if (!url) {
      throw new Error('Server URL is not set');
    }
    return url;
  }

  getFolderLists(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.getBaseUrl()}/folders`);
  }

  getVideosByFolder(folder: string): Observable<ApiResponse<VideoData[]>> {
    return this.http.get<ApiResponse<VideoData[]>>(
      `${this.getBaseUrl()}/videos?folder=${encodeURIComponent(folder)}`
    );
  }

  getVideoById(videoId: string): Observable<ApiResponse<VideoData>> {
    return this.http.get<ApiResponse<VideoData>>(
      `${this.getBaseUrl()}/videos/${videoId}`
    );
  }

  getVideosByIds(ids: string[]): Observable<ApiResponse<VideoData[]>> {
    return this.http.post<ApiResponse<VideoData[]>>(
      `${this.getBaseUrl()}/videos/batch`,
      { ids }
    );
  }

  getStreamUrl(videoId: string): string {
    return `${this.getBaseUrl()}/stream/${videoId}`;
  }

  getDownloadUrl(videoId: string): string {
    return `${this.getBaseUrl()}/download/${videoId}`;
  }

  getThumbnailUrl(videoId: string): string {
    return `${this.getBaseUrl()}/thumbnail/${videoId}`;
  }

  getPreviewUrl(videoId: string): string {
    return `${this.getBaseUrl()}/preview/${videoId}`;
  }
}
