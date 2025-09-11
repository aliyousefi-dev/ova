import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from './response-type';

import { environment } from '../../../environments/environment';

export interface SearchSuggestionsResponse {
  query: string;
  suggestions: string[];
}

@Injectable({
  providedIn: 'root',
})
export class SuggestionApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

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
