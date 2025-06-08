import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Eye,
  EyeOff,
  Settings,
  Terminal,
} from 'lucide-angular';
import { LogsPanelComponent } from '../../panels/logs-panel/logs-panel';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, LogsPanelComponent],
  templateUrl: 'bottom-nav.html',
})
export class BottomNavComponent {
  @Output() settingsClicked = new EventEmitter<void>();

  showLogs = true;
  logPanelHeight = 300;
  resizing = false;
  navbarHeight = 40; // px, matches h-10

  eye = Eye;
  eyeOff = EyeOff;
  settings = Settings;
  terminal = Terminal;

  startResize(event: MouseEvent) {
    this.resizing = true;
    event.preventDefault();
  }

  onMouseMove(event: MouseEvent) {
    if (!this.resizing) return;
    const windowHeight = window.innerHeight;
    this.logPanelHeight = windowHeight - event.clientY;
    if (this.logPanelHeight < 50) this.logPanelHeight = 50;
    if (this.logPanelHeight > windowHeight - 100)
      this.logPanelHeight = windowHeight - 100;
  }

  stopResize() {
    this.resizing = false;
  }

  toggleLogs() {
    this.showLogs = !this.showLogs;
  }

  openSettings() {
    this.settingsClicked.emit();
  }

  openTerminal() {
    console.log('Terminal Open');
  }
}
