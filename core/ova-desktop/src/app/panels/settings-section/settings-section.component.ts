import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-settings-section',
  templateUrl: './settings-section.component.html',
})
export class SettingsSectionComponent {
  @Input() settings: any;
  @Output() saveSettingsEvent = new EventEmitter<void>();

  saveSettings() {
    this.saveSettingsEvent.emit();
  }
}
