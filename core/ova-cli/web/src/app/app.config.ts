import {
  ApplicationConfig,
  provideZoneChangeDetection,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

import { routes } from './app.routes';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorInterceptor } from './services/error.interceptor';
import { withViewTransitions } from '@angular/router';
import { RouteReuseStrategy } from '@angular/router';
import { CustomRouteReuseStrategy } from './reuse-strategy';
import { ExtraOptions } from '@angular/router';

const routerOptions: ExtraOptions = {
  enableTracing: false, // Disable router event tracing
  useHash: false, // Use regular routing (no hash in the URL)
  scrollPositionRestoration: 'enabled', // Automatically restore scroll position
  scrollOffset: [0, 64], // Add an offset for scroll restoration (e.g., for a sticky header)
  anchorScrolling: 'enabled', // Enable anchor scrolling behavior (scroll to elements with a #id in the URL)
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes, withViewTransitions()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
    {
      provide: RouteReuseStrategy, // Provide your custom strategy here
      useClass: CustomRouteReuseStrategy,
    },
  ],
};
