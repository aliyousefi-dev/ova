import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VideoData } from '../data-types/video-data.model';

@Injectable({
  providedIn: 'root',
})
export class APIService {
  private baseUrl = '/api/v1'; // same-origin, relative path

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post<{
      data: { sessionId: string };
      message: string;
      status: string;
    }>(
      `${this.baseUrl}/auth/login`,
      { username, password },
      {
        withCredentials: true,
      }
    );
  }

  logout() {
    return this.http.post<{ message: string; status: string }>(
      `${this.baseUrl}/auth/logout`,
      null,
      { withCredentials: true }
    );
  }

  getFolders(): Observable<any> {
    return this.http.get(`${this.baseUrl}/folders`, {
      withCredentials: true,
    });
  }

  getVideos(folder: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/videos?folder=${encodeURIComponent(folder)}`,
      { withCredentials: true }
    );
  }

  getVideoById(videoId: string): Observable<{ data: VideoData }> {
    return this.http.get<{ data: VideoData }>(
      `${this.baseUrl}/videos/${videoId}`,
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
}
