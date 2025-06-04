import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, AuthStatusResponse } from '../data-types/responses';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private baseUrl = '/api/v1';

  constructor(private http: HttpClient) {}

  login(
    username: string,
    password: string
  ): Observable<ApiResponse<{ sessionId: string }>> {
    return this.http.post<ApiResponse<{ sessionId: string }>>(
      `${this.baseUrl}/auth/login`,
      { username, password }
    );
  }

  logout(): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${this.baseUrl}/auth/logout`,
      null
    );
  }

  checkAuth(): Observable<AuthStatusResponse> {
    return this.getAuthStatusFull().pipe(map((res) => res.data));
  }

  getAuthStatusFull(): Observable<ApiResponse<AuthStatusResponse>> {
    return this.http.get<ApiResponse<AuthStatusResponse>>(
      `${this.baseUrl}/auth/status`
    );
  }
}
