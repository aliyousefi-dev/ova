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
  isLoading: boolean = false;
  isServerUp: boolean = false;

  runNewRepo() {
    this.runNewRepoEvent.emit();
  }

  chooseFolder() {
    this.chooseFolderEvent.emit();
  }

  async serveRepo() {
    this.isLoading = true;
    await this.delay(500); // Simulate a 2-second delay
    this.isServing = !this.isServing;
    this.isLoading = false;
    this.isServerUp = !this.isServerUp;

    if (this.isServing) {
      this.serveEvent.emit();
    } else {
      this.stopServeEvent.emit();
    }
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
