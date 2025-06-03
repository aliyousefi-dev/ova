import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { APIService } from '../services/api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private apiService: APIService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.apiService.getAuthStatusFull().pipe(
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
