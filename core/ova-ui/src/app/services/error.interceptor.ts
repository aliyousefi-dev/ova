import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // handle not authenticated - maybe redirect to login
          console.error('Not authenticated!');
          // TODO: You can add logic here to navigate to login page
        } else if (error.status === 0) {
          // Network error or server down
          console.error('Server not available');
        }
        // Pass the error to the component or further error handlers
        return throwError(() => error);
      })
    );
  }
}
