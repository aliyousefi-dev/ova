import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: 'bottom-nav.html',
})
export class BottomNavComponent {
  @Output() toggleLogsEvent = new EventEmitter<void>();

  showLogs = true;

  eye = Eye;
  eyeOff = EyeOff;

  toggleLogs() {
    this.showLogs = !this.showLogs;
    this.toggleLogsEvent.emit();
  }
}
