import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LoadingService } from '../services/loading.service';
import { LoadingSpinnerComponent } from '../components/utility/spinner-loading/spinner-loading.component';
import { CommonModule } from '@angular/common';
import { DesktopSidebarComponent } from '../components/panels/desktop-sidebar/desktop-sidebar.component';
import { TopNavbarComponent } from '../components/panels/top-navbar/top-navbar.component';
import { MobileDockComponent } from '../components/panels/mobile-dock/mobile-dock.component';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    DesktopSidebarComponent,
    TopNavbarComponent,
    MobileDockComponent,
    MatButtonModule,
    MatSidenavModule,
    MatPaginatorModule,
  ],
  templateUrl: './main-app.html',
  styles: [
    `
      .sidebar-container {
        background: var(--b1);
      }

      .sidebar-sidenav {
        background: var(--b1);
        border-radius: 0px;
      }
    `,
  ],
})
export class MainApp {
  drawerMode: 'over' | 'side' = 'side';
  drawerOpened = true;

  constructor() {
    this.updateDrawerMode();
  }

  ngOnInit() {
    this.updateDrawerMode();
    window.addEventListener('resize', this.updateDrawerMode.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.updateDrawerMode.bind(this));
  }

  private updateDrawerMode() {
    if (window.innerWidth < 1024) {
      this.drawerMode = 'over';
      this.drawerOpened = false;
    } else {
      this.drawerMode = 'side';
      this.drawerOpened = true;
    }
  }
}
