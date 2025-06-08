import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings-section',
  templateUrl: './settings-section.component.html',
  imports: [FormsModule, CommonModule],
})
export class SettingsSectionComponent {
  @Input() settings: { hostname: string; port: number } = {
    hostname: '',
    port: 0,
  };
  @Output() saveSettingsEvent = new EventEmitter<void>();

  saveSettings() {
    this.saveSettingsEvent.emit();
  }
}
