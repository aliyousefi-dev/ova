import {
  Component,
  ElementRef,
  OnInit,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logs-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logs-panel.html',
})
export class LogsPanelComponent implements OnInit {
  private logs: string[] = [];
  copied = false;

  get cliLines(): string[] {
    return this.logs;
  }

  constructor(
    private el: ElementRef,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    (window as any).electronAPI.onLogShortcut((log: string) => {
      console.log('Log shortcut received:', log); // Debugging line
      this.zone.run(() => {
        this.addLog(log);
      });
    });

    (window as any).electronAPI.onSettingsSavedLog((log: string) => {
      console.log('Settings saved log received:', log);
      this.zone.run(() => {
        this.addLog(log);
      });
    });

    (window as any).electronAPI.onServeRepoLog((log: string) => {
      console.log('Serve repo log received:', log);
      this.zone.run(() => {
        this.addLog(log);
      });
    });
  }

  addLog(log: string) {
    this.logs.push(log);
  }

  copyLogs() {
    if (!this.logs.length) return;

    navigator.clipboard.writeText(this.logs.join('\n')).then(
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
    this.logs = [];
  }
}
