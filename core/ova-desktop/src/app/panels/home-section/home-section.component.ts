import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-section',
  templateUrl: './home-section.component.html',
  imports: [CommonModule],
})
export class HomeSectionComponent {
  @Input() newRepoPath: string = '';
  @Output() runNewRepoEvent = new EventEmitter<void>();
  @Output() chooseFolderEvent = new EventEmitter<void>();
  @Output() serveEvent = new EventEmitter<void>();
  @Output() stopServeEvent = new EventEmitter<void>();

  isServing: boolean = false;

  runNewRepo() {
    this.runNewRepoEvent.emit();
  }

  chooseFolder() {
    this.chooseFolderEvent.emit();
  }

  serveRepo() {
    this.isServing = !this.isServing;
    if (this.isServing) {
      this.serveEvent.emit();
    } else {
      this.stopServeEvent.emit();
    }
  }
}
