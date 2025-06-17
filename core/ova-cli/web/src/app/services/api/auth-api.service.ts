import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../../data-types/responses';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface LoginResponse {
  data: {
    sessionId: string;
  };
  message: string;
  status: string;
}

export interface AuthStatusResponse {
  authenticated: boolean;
  username?: string;
}

export interface UserProfile {
  username: string;
  roles: string[];
}

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
          if (response.data?.sessionId) {
            localStorage.setItem('sessionId', response.data.sessionId);
          }
          return response;
        }),
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'An error occurred during login.';

          if (error.status === 0) {
            // Network error, server down, or CORS issue
            errorMessage =
              'Cannot connect to the server. Please try again later.';
          } else if (error.status >= 500) {
            // Server error
            errorMessage = 'Server error occurred. Please try again later.';
          } else if (error.error?.message) {
            // Custom backend error message
            errorMessage = error.error.message;
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }

  logout(): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${this.baseUrl}/auth/logout`,
      null,
      { withCredentials: true }
    );
  }

  checkAuth(): Observable<AuthStatusResponse> {
    return this.getAuthStatusFull().pipe(map((res) => res.data));
  }

  getAuthStatusFull(): Observable<ApiResponse<AuthStatusResponse>> {
    return this.http.get<ApiResponse<AuthStatusResponse>>(
      `${this.baseUrl}/auth/status`,
      { withCredentials: true }
    );
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/auth/profile`, {
      withCredentials: true,
    });
  }
}
