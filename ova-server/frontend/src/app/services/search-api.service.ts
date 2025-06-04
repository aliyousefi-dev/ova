import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse, SearchResponse } from '../data-types/responses';

@Injectable({
  providedIn: 'root',
})
export class SearchApiService {
  private baseUrl = '/api/v1';

  constructor(private http: HttpClient) {}

  searchVideos(query: string): Observable<ApiResponse<SearchResponse>> {
    return this.http.post<ApiResponse<SearchResponse>>(
      `${this.baseUrl}/search`,
      { query }
    );
  }
}
