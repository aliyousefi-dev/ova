import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LoadingService } from '../services/loading.service';
import { LoadingSpinnerComponent } from '../components/utility/spinner-loading/spinner-loading.component';
import { CommonModule } from '@angular/common';
import { DesktopSidebarComponent } from '../components/panels/desktop-sidebar/desktop-sidebar.component';
import { TopNavbarComponent } from '../components/panels/top-navbar/top-navbar.component';
import { MobileDockComponent } from '../components/panels/mobile-dock/mobile-dock.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    DesktopSidebarComponent,
    TopNavbarComponent,
    MobileDockComponent,
  ],
  templateUrl: './main-app.html',
})
export class MainApp {}
