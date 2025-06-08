import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule, FormsModule], // <-- Add FormsModule here
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  protected title = 'ova-desktop';

  cliOutput: string | null = null;
  cliError: string | null = null;
  newRepoPath: string = ''; // <-- bind to input

  async runCliCommand() {
    this.cliOutput = null;
    this.cliError = null;

    try {
      const result = await window.electronAPI.runCli(['--help']);
      if (result.success) {
        this.cliOutput = result.output ?? '';
      } else {
        this.cliError = result.error ?? 'Unknown error';
      }
    } catch (err) {
      this.cliError = (err as Error).message;
    }
  }

  async runNewRepo() {
    this.cliOutput = null;
    this.cliError = null;

    if (!this.newRepoPath.trim()) {
      this.cliError = 'Please enter a valid repository path.';
      return;
    }

    try {
      const result = await window.electronAPI.runCli([
        'init',
        this.newRepoPath.trim(),
      ]);
      if (result.success) {
        this.cliOutput =
          `Repository initialized at ${this.newRepoPath}\n` +
          (result.output ?? '');
      } else {
        this.cliError = result.error ?? 'Unknown error';
      }
    } catch (err) {
      this.cliError = (err as Error).message;
    }
  }
}
