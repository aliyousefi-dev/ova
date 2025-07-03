import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- add this

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.component.html',
})
export class ToastComponent {
  @Input() message: string | null = null;
  @Input() type: 'error' | 'info' | 'success' = 'info'; // customize styles if needed

  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
