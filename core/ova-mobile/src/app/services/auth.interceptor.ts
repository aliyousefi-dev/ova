import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Retrieve sessionId from localStorage
    const sessionId = localStorage.getItem('sessionId'); // Assuming 'sessionId' is stored here

    // If the sessionId exists, add it as a custom header (OVA-AUTH)
    if (sessionId) {
      const clonedRequest = req.clone({
        setHeaders: {
          'OVA-AUTH': sessionId, // Use the sessionId as a custom header
        },
      });

      // Pass the modified request to the next handler
      return next.handle(clonedRequest);
    }

    // If no sessionId, pass the original request
    return next.handle(req);
  }
}
