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
import { TerminalPanelComponent } from '../../panels/terminal-panel/terminal-panel';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    LogsPanelComponent,
    TerminalPanelComponent,
  ],
  templateUrl: 'bottom-nav.html',
})
export class BottomNavComponent {
  @Output() settingsClicked = new EventEmitter<void>();

  showLogs = true;
  showTerminal = false;
  logPanelHeight = 300;
  terminalPanelHeight = 300;
  resizing = false;
  resizingTerminal = false;
  navbarHeight = 40; // px, matches h-10

  eye = Eye;
  eyeOff = EyeOff;
  settings = Settings;
  terminal = Terminal;

  startResize(event: MouseEvent) {
    this.resizing = true;
    event.preventDefault();
  }

  startResizeTerminal(event: MouseEvent) {
    this.resizingTerminal = true;
    event.preventDefault();
  }

  onMouseMove(event: MouseEvent) {
    if (this.resizing) {
      const windowHeight = window.innerHeight;
      this.logPanelHeight =
        windowHeight -
        event.clientY -
        (this.showTerminal ? this.terminalPanelHeight : 0);
      if (this.logPanelHeight < 50) this.logPanelHeight = 50;
      if (this.logPanelHeight > windowHeight - 100)
        this.logPanelHeight = windowHeight - 100;
    }
    if (this.resizingTerminal) {
      const windowHeight = window.innerHeight;
      this.terminalPanelHeight =
        windowHeight - event.clientY - this.navbarHeight;
      if (this.terminalPanelHeight < 50) this.terminalPanelHeight = 50;
      if (this.terminalPanelHeight > windowHeight - 100)
        this.terminalPanelHeight = windowHeight - 100;
    }
  }

  stopResize() {
    this.resizing = false;
    this.resizingTerminal = false;
  }

  toggleLogs() {
    if (!this.showLogs) {
      this.showLogs = true;
      this.showTerminal = false;
    } else {
      this.showLogs = false;
    }
  }

  toggleTerminal() {
    if (!this.showTerminal) {
      this.showTerminal = true;
      this.showLogs = false;
    } else {
      this.showTerminal = false;
    }
  }

  openSettings() {
    this.settingsClicked.emit();
  }

  openTerminal() {
    this.toggleTerminal();
  }
}
