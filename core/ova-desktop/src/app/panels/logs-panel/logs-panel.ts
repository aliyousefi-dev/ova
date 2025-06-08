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

  getLineClass(line: string): string {
    const lower = line.toLowerCase();
    if (lower.includes('error')) return 'text-red-500';
    if (lower.includes('warning')) return 'text-yellow-400';
    if (lower.includes('info')) return 'text-green-400';
    return 'text-white';
  }

  getStatusCircleClass(line: string): string {
    const lower = line.toLowerCase();
    if (lower.includes('error')) return 'bg-red-500';
    if (lower.includes('warning')) return 'bg-yellow-400';
    if (lower.includes('info')) return 'bg-green-400';
    return 'bg-transparent'; // invisible circle for lines without status
  }

  clearLogs() {
    this.cliOutput = '';
  }
}
