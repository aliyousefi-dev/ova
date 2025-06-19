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
import { LoadingSpinnerComponent } from './components/common/spinner-loading/spinner-loading.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingSpinnerComponent, CommonModule],
  templateUrl: './app.html',
})
export class App implements OnInit {
  private router = inject(Router);
  private loadingService = inject(LoadingService);

  loading$ = this.loadingService.loading$;

  protected title = 'frontend';

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
    });
  }
}
