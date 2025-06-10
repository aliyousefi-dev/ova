import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse, SearchResponse } from '../data-types/responses';
import { ServerConfigService } from './server-config.service';

@Injectable({
  providedIn: 'root',
})
export class SearchApiService {
  constructor(
    private http: HttpClient,
    private serverConfig: ServerConfigService
  ) {}

  private getBaseUrl(): string {
    const url = localStorage.getItem('server_url') || null;
    if (!url) {
      throw new Error('VideoAPI - Server URL is not set');
    }
    return url;
  }

  searchVideos(query: string): Observable<ApiResponse<SearchResponse>> {
    return this.http.post<ApiResponse<SearchResponse>>(
      `${this.getBaseUrl()}/search`,
      { query }
    );
  }
}
