import { Component, OnInit, inject } from '@angular/core';
import {
  Router,
  RouterOutlet,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { LoadingService } from './services/loading.service';
import { LoadingSpinnerComponent } from './components/utility/spinner-loading/spinner-loading.component';
import { CommonModule } from '@angular/common';
import { DesktopSidebarComponent } from './components/navigation/desktop-sidebar/desktop-sidebar.component';
import { TopNavbarComponent } from './components/navigation/top-navbar/top-navbar.component';
import { MobileDockComponent } from './components/navigation/mobile-dock/mobile-dock.component';

import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    LoadingSpinnerComponent,
    CommonModule,
    DesktopSidebarComponent,
    TopNavbarComponent,
    MobileDockComponent,
  ],
  templateUrl: './app.html',
})
export class App implements OnInit {
  private router = inject(Router);
  private loadingService = inject(LoadingService);

  loading$ = this.loadingService.loading$;
  isLoginRoute: boolean = false;
  isNotFoundRoute: boolean = false;

  constructor(private location: Location) {}

  pageTitle: string = 'home';

  // Dynamically set page title based on the route
  setPageTitle(): void {
    const currentRoute = this.location.path().split('?')[0]; // Get the route without query parameters
    console.log(currentRoute);

    // Grab the first part of the path to set it as the title
    const pathSegments = currentRoute
      .split('/')
      .filter((segment) => segment.length > 0); // Filter out any empty segments
    const firstPathSegment = pathSegments[0];

    // Capitalize the first letter of the first path segment
    const capitalizedSegment = firstPathSegment
      ? firstPathSegment.charAt(0).toUpperCase() + firstPathSegment.slice(1)
      : 'Home'; // Default to 'Home' if empty

    // Set the title dynamically
    this.pageTitle = capitalizedSegment;
  }

  ngOnInit() {
    // Set theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.setPageTitle();

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
        this.setPageTitle();
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
