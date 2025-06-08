import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  ViewChild,
  ElementRef,
  Input,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-terminal-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './terminal-panel.html',
})
export class TerminalPanelComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @Input() tabId!: number;
  @Input() currentPath: string = '~';

  command = '';
  output: string[] = [];
  running = false;
  private cliLogHandler: ((msg: string) => void) | null = null;

  @ViewChild('terminalInput') terminalInput!: ElementRef<HTMLInputElement>;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  constructor(private zone: NgZone) {}

  ngOnInit() {
    // Listen for live CLI output
    this.cliLogHandler = (msg: string) => {
      this.zone.run(() => {
        this.output.push(msg);
        this.scrollToBottom();
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

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop =
          this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 0);
  }

  async runCommand() {
    if (!this.command.trim()) return;
    this.running = true;
    this.output.push(`ovacli [${this.currentPath}] $ ${this.command}`);
    this.scrollToBottom();
    try {
      // @ts-ignore
      const result = await window.electronAPI.runCli(this.command.split(' '));
      if (result.output) this.output.push(result.output);
      if (result.error) this.output.push(`[ERROR] ${result.error}`);
      this.scrollToBottom();
    } catch (err: any) {
      this.output.push(`[ERROR] ${err.message}`);
      this.scrollToBottom();
    }
    this.running = false;
    this.command = '';
    this.focusInput();
    this.scrollToBottom();
  }

  clearOutput() {
    this.output = [];
  }
}
