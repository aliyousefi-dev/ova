import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Eye,
  EyeOff,
  Settings,
  Terminal,
} from 'lucide-angular';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: 'bottom-nav.html',
})
export class BottomNavComponent {
  @Output() toggleLogsEvent = new EventEmitter<void>();
  @Output() settingsClicked = new EventEmitter<void>();

  showLogs = true;

  eye = Eye;
  eyeOff = EyeOff;
  settings = Settings;
  terminal = Terminal;

  toggleLogs() {
    this.showLogs = !this.showLogs;
    this.toggleLogsEvent.emit();
  }

  openSettings() {
    this.settingsClicked.emit();
  }

  openTerminal() {
    console.log('Terminal Open');
  }
}
