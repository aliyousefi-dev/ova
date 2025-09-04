import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsSidebarComponent } from './panels/settings-sidebar/settings-sidebar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, SettingsSidebarComponent, RouterOutlet],
  templateUrl: './settings.page.html',
})
export class SettingsPage {}
