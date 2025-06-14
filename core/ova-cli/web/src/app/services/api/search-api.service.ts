import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse, SearchResponse } from '../../data-types/responses';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SearchApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // search-api.service.ts
  searchVideos(params: {
    query?: string;
    tags?: string[];
  }): Observable<ApiResponse<SearchResponse>> {
    return this.http.post<ApiResponse<SearchResponse>>(
      `${this.baseUrl}/search`,
      params
    );
  }
}
