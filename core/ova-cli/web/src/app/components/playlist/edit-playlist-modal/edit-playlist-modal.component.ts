import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-playlist-modal',
  templateUrl: './edit-playlist-modal.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class EditPlaylistModalComponent {
  @Input() visible = false;
  @Input() title = '';
  @Input() description = '';
  @Output() cancelled = new EventEmitter<void>();
  @Output() saved = new EventEmitter<{ title: string; description: string }>();

  onCancel() {
    this.cancelled.emit();
  }

  onConfirm() {
    if (this.title.trim()) {
      this.saved.emit({
        title: this.title.trim(),
        description: this.description,
      });
    }
  }
}
