import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-playlist-create-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './playlist-create-modal.component.html',
})
export class PlaylistCreateModalComponent implements OnChanges {
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<string>();
  @ViewChild('dialogRef') dialogRef!: ElementRef<HTMLDialogElement>;
  @ViewChild('playlistInput') playlistInput!: ElementRef<HTMLInputElement>;

  playlistName = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']) {
      if (this.visible) {
        setTimeout(() => {
          this.dialogRef?.nativeElement?.showModal?.();
          this.playlistInput?.nativeElement?.focus(); // 👈 Focus input
        }, 0);
      } else {
        this.dialogRef?.nativeElement?.close?.();
      }
    }
  }

  submit(): void {
    const trimmed = this.playlistName.trim();
    if (trimmed) {
      this.create.emit(trimmed);
      this.playlistName = '';
    }
  }

  onCancel(): void {
    this.playlistName = '';
    this.close.emit();
  }
}
