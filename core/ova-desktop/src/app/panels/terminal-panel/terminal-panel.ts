import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-terminal-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './terminal-panel.html',
})
export class TerminalPanelComponent implements OnInit, OnDestroy {
  command = '';
  output: string[] = [];
  running = false;
  private cliLogHandler: ((msg: string) => void) | null = null;
  currentPath = '~'; // Set this to your actual working directory if available

  @ViewChild('terminalInput') terminalInput!: ElementRef<HTMLInputElement>;

  constructor(private zone: NgZone) {}

  ngOnInit() {
    // Listen for live CLI output
    this.cliLogHandler = (msg: string) => {
      this.zone.run(() => {
        this.output.push(msg);
      });
    };
    // @ts-ignore
    window.electronAPI.onCliLog(this.cliLogHandler);
  }

  ngOnDestroy() {
    // No built-in way to remove listeners in this preload, but you could add one if needed.
    // For now, just set handler to null.
    this.cliLogHandler = null;
  }

  focusInput() {
    setTimeout(() => this.terminalInput?.nativeElement.focus(), 0);
  }

  async runCommand() {
    if (!this.command.trim()) return;
    this.running = true;
    this.output.push(`$ ${this.command}`);
    try {
      // @ts-ignore
      const result = await window.electronAPI.runCli(this.command.split(' '));
      if (result.output) this.output.push(result.output);
      if (result.error) this.output.push(`[ERROR] ${result.error}`);
    } catch (err: any) {
      this.output.push(`[ERROR] ${err.message}`);
    }
    this.running = false;
    this.command = '';
    this.focusInput();
  }

  clearOutput() {
    this.output = [];
  }
}
