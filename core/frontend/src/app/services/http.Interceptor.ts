import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class SessionInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      const cloned = request.clone({
        setHeaders: {
          'X-Session-Id': sessionId,
        },
      });
      return next.handle(cloned);
    } else {
      return next.handle(request);
    }
  }
}
