import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OvaLogoComponent } from '../../utility/ova-logo/ova-logo.component';
import { OvaAboutModalComponent } from '../../pop-ups/ova-about-modal/ova-about-modal.component';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-desktop-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    OvaLogoComponent,
    OvaAboutModalComponent,
  ],
  templateUrl: './desktop-sidebar.component.html',
})
export class DesktopSidebarComponent {
  @ViewChild(OvaAboutModalComponent) aboutModal!: OvaAboutModalComponent;

  sidebarOpen = true; // Initial state: sidebar is open

  openOvaAbout() {
    this.aboutModal.open();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
