declare global {
  interface Window {
    electronAPI: {
      runCli: (
        args: string[]
      ) => Promise<{ success: boolean; output?: string; error?: string }>;
    };
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  protected title = 'ova-desktop';

  cliOutput: string | null = null;
  cliError: string | null = null;

  async runCliCommand() {
    console.log('[Angular] CLI Button clicked'); // Confirm method is called

    this.cliOutput = null;
    this.cliError = null;

    try {
      const result = await window.electronAPI.runCli(['--help']);
      console.log('[Angular] CLI Result:', result); // Confirm result received

      if (result.success) {
        this.cliOutput = result.output ?? '';
      } else {
        this.cliError = result.error ?? 'Unknown error';
      }
    } catch (err) {
      console.error('[Angular] CLI Error:', err);
      this.cliError = (err as Error).message;
    }
  }
}
