import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { VideoData } from '../../data-types/video-data';
import { ApiResponse } from './response-type';

import { environment } from '../../../environments/environment';

interface SimilarVideosResponse {
  similarVideos: VideoData[];
}

@Injectable({
  providedIn: 'root',
})
export class VideoApiService {
  private baseUrl = environment.apiBaseUrl;

  private videoCache = new Map<string, VideoData>();

  constructor(private http: HttpClient) {}

  getVideosByFolder(folder: string): Observable<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (folder) {
      params.set('folder', folder);
    }
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/videos?${params.toString()}`,
      { withCredentials: true }
    );
  }

  getVideoById(videoId: string): Observable<ApiResponse<VideoData>> {
    const cached = this.videoCache.get(videoId);
    if (cached) {
      return of({
        data: cached,
        message: 'Loaded from cache',
        status: 'success',
      });
    }

    return this.http
      .get<ApiResponse<VideoData>>(`${this.baseUrl}/videos/${videoId}`, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          if (res.status === 'success') {
            this.videoCache.set(videoId, res.data);
          }
        })
      );
  }

  getVideosByIds(ids: string[]): Observable<ApiResponse<VideoData[]>> {
    return this.http.post<ApiResponse<VideoData[]>>(
      `${this.baseUrl}/videos/batch`,
      { IDs: ids }, // <-- send array of string IDs, not video objects
      { withCredentials: true }
    );
  }

  getSimilarVideos(
    videoId: string
  ): Observable<ApiResponse<SimilarVideosResponse>> {
    return this.http.get<ApiResponse<SimilarVideosResponse>>(
      `${this.baseUrl}/videos/${videoId}/similar`,
      { withCredentials: true }
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

  getStoryboardVttUrl(videoId: string): string {
    return `${this.baseUrl}/storyboards/${videoId}/thumbnails.vtt`;
  }

  getTrimmedDownloadUrl(videoId: string, start: number, end?: number): string {
    const params = new URLSearchParams();
    params.set('start', start.toString());
    if (end !== undefined) {
      params.set('end', end.toString());
    }
    return `${this.baseUrl}/download/${videoId}/trim?${params.toString()}`;
  }

  // Remove whole update of tags; instead add & remove individual tags

  addVideoTag(
    videoId: string,
    tag: string
  ): Observable<ApiResponse<{ tags: string[] }>> {
    return this.http.post<ApiResponse<{ tags: string[] }>>(
      `${this.baseUrl}/videos/tags/${videoId}/add`,
      { tag },
      { withCredentials: true }
    );
  }

  removeVideoTag(
    videoId: string,
    tag: string
  ): Observable<ApiResponse<{ tags: string[] }>> {
    return this.http.post<ApiResponse<{ tags: string[] }>>(
      `${this.baseUrl}/videos/tags/${videoId}/remove`,
      { tag },
      { withCredentials: true }
    );
  }

  // Optional: Clear cache (e.g. if you want to invalidate on logout or refresh)
  clearCache(): void {
    this.videoCache.clear();
  }
}
