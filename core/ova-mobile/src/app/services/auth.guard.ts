import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthApiService } from './api/auth-api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  // Add a debugMode flag to control whether the guard should bypass the process
  private debugMode: boolean = true;

  constructor(private authapi: AuthApiService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    if (this.debugMode) {
      // If debugMode is true, simply allow access without checking authentication status
      return of(true);
    }

    return this.authapi.getAuthStatusFull().pipe(
      map((res) => {
        if (res.status === 'success' && res.data.authenticated) {
          localStorage.setItem('username', res.data.username ?? '');
          return true;
        } else {
          localStorage.removeItem('username');
          return this.router.createUrlTree(['/login']);
        }
      }),
      catchError(() => {
        localStorage.removeItem('username');
        return of(this.router.createUrlTree(['/login']));
      })
    );
  }

  // Optional setter method to toggle debugMode
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }
}
