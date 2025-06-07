import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthApiService } from './auth-api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private authapi: AuthApiService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
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
}
