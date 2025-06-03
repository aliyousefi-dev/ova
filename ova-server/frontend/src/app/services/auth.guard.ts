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
    return this.apiService.checkAuth().pipe(
      map((res) =>
        res.authenticated ? true : this.router.createUrlTree(['/login'])
      ),
      catchError(() => of(this.router.createUrlTree(['/login'])))
    );
  }
}
