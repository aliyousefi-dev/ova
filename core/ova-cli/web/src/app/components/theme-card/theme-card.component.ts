import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-theme-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './theme-card.component.html',
})
export class ThemeCardComponent {
  @Input() themes: string[] = [];
  @Input() selectedTheme = '';
  @Output() themeChange = new EventEmitter<string>();

  select(theme: string) {
    this.themeChange.emit(theme);
  }
}
