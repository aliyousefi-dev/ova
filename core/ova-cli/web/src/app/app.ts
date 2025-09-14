import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterOutlet,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';

import { OnInit, inject } from '@angular/core';
import { LoadingService } from './services/loading.service';

import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MatProgressBarModule],
  templateUrl: './app.html',
})
export class App implements OnInit {
  private router = inject(Router);
  private loadingService = inject(LoadingService);

  loading$ = this.loadingService.loading$;
  isLoginRoute: boolean = false;
  isNotFoundRoute: boolean = false;

  ngOnInit() {
    // Set theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Listen to router navigation events to toggle loading spinner
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loadingService.show();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loadingService.hide();
      }

      // Check if the current route is /login
      this.isLoginRoute = this.router.url === '/login';

      // Check if the current route is NotFoundPage (wildcard route)
      if (
        event instanceof NavigationError ||
        event instanceof NavigationCancel
      ) {
        this.isNotFoundRoute = true; // Set the flag for 404 when error occurs
      } else {
        this.isNotFoundRoute = false; // Reset if valid route
      }
    });
  }
}
