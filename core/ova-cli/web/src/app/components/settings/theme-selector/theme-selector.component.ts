import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-theme-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-selector.component.html', // <-- use external HTML file
  styles: [],
})
export class ThemeSelectorComponent {
  @Input() themes: string[] = [];
  @Input() selectedTheme = '';
  @Output() themeChange = new EventEmitter<string>();

  select(theme: string) {
    this.themeChange.emit(theme);
  }
}
