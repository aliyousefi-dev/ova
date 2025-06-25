import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../data-types/responses';

export interface VttChapter {
  startTime: number; // seconds from video start, e.g. 0, 60.5
  title: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChapterApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getChapters(
    videoId: string
  ): Observable<ApiResponse<{ chapters: VttChapter[] }>> {
    return this.http.get<ApiResponse<{ chapters: VttChapter[] }>>(
      `${this.baseUrl}/video/chapters/${videoId}`,
      { withCredentials: true }
    );
  }

  updateChapters(
    videoId: string,
    chapters: VttChapter[]
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/video/chapters/${videoId}`,
      { chapters },
      { withCredentials: true }
    );
  }
}
