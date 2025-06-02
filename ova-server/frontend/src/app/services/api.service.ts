import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VideoData } from '../data-types/video-data.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class APIService {
  private baseUrl: string = '';

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.baseUrl = this.configService.apiUrl;
  }

  getFolders(): Observable<any> {
    return this.http.get(`${this.baseUrl}/folders`);
  }

  getVideos(folder: string): Observable<any> {
    const url = `${this.baseUrl}/videos?folder=${encodeURIComponent(folder)}`;
    return this.http.get(url);
  }

  getVideoById(videoId: string): Observable<{ data: VideoData }> {
    return this.http.get<{ data: VideoData }>(
      `${this.baseUrl}/videos/${videoId}`
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
