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
  @Output() restartServerEvent = new EventEmitter<void>(); // Added

  isServing: boolean = false;
  isLoading: boolean = false;
  isServerUp: boolean = false;
  isRestarting: boolean = false; // Added

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

  async restartServer() {
    this.isRestarting = true;
    await this.delay(500); // Simulate a delay for restart
    this.restartServerEvent.emit();
    this.isRestarting = false;
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
