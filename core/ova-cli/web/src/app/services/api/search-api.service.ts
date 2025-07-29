import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VideoData } from '../../data-types/video-data';

import { ApiResponse } from '../../data-types/responses';

import { environment } from '../../../environments/environment';

export interface SearchResponse {
  query: string;
  results: VideoData[];
  totalCount: number;
}

export interface SearchSuggestionsResponse {
  query: string;
  suggestions: string[];
}

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

  getSearchSuggestions(
    query: string
  ): Observable<ApiResponse<SearchSuggestionsResponse>> {
    const params = { query }; // The query parameter to send in the request body

    return this.http.post<ApiResponse<SearchSuggestionsResponse>>(
      `${this.baseUrl}/search-suggestions`,
      params
    );
  }
}
