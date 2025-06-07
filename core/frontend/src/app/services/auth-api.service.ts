import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, AuthStatusResponse } from '../data-types/responses';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  login(
    username: string,
    password: string
  ): Observable<ApiResponse<{ sessionId: string }>> {
    return this.http
      .post<ApiResponse<{ sessionId: string }>>(
        `${this.baseUrl}/auth/login`,
        { username, password },
        { withCredentials: true }
      )
      .pipe(
        map((response) => {
          if (response.data && response.data.sessionId) {
            localStorage.setItem('sessionId', response.data.sessionId);
          }
          return response;
        })
      );
  }

  logout(): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${this.baseUrl}/auth/logout`,
      null,
      { withCredentials: true } // ✅ include this
    );
  }

  checkAuth(): Observable<AuthStatusResponse> {
    return this.getAuthStatusFull().pipe(map((res) => res.data));
  }

  getAuthStatusFull(): Observable<ApiResponse<AuthStatusResponse>> {
    return this.http.get<ApiResponse<AuthStatusResponse>>(
      `${this.baseUrl}/auth/status`,
      { withCredentials: true } // ✅ include this
    );
  }
}
