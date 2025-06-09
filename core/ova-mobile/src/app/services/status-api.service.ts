import { Injectable } from '@angular/core';
import { ApiResponse, StatusResponse } from '../data-types/responses';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatusApiService {
  constructor(private http: HttpClient) {}

  getServerStatus(baseUrl: string): Observable<ApiResponse<StatusResponse>> {
    // Ensure no trailing slash for consistency
    const url = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return this.http.get<ApiResponse<StatusResponse>>(`${url}/status`);
  }
}
