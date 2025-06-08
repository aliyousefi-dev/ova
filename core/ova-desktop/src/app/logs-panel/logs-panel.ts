import { Component, Input, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logs-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logs-panel.html',
})
export class LogsPanelComponent {
  @Input() cliOutput: string = '';
  copied = false;

  get cliLines(): string[] {
    const lines = this.cliOutput.split('\n');
    if (lines.length && lines[lines.length - 1] === '') {
      lines.pop();
    }
    return lines;
  }

  constructor(private el: ElementRef) {}

  copyLogs() {
    if (!this.cliOutput) return;

    navigator.clipboard.writeText(this.cliOutput).then(
      () => {
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 1500);
      },
      (err) => {
        console.error('Failed to copy logs: ', err);
      }
    );
  }

  clearLogs() {
    this.cliOutput = '';
  }
}
