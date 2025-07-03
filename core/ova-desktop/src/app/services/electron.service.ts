import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  constructor() {}

  // Method to run the CLI with arguments
  runCli(args: string[]): Promise<{ success: boolean; error?: string }> {
    return window['electronAPI'].runCli(args);
  }

  // Method to open a folder picker dialog
  pickFolder(): Promise<string | null> {
    return window['electronAPI'].pickFolder();
  }

  // Method to open folder in file explorer (OS-specific)
  openInExplorer(folderPath: string): void {
    window['electronAPI'].openInExplorer(folderPath);
  }

  // Subscribe to CLI logs
  onCliLog(callback: (msg: string) => void): void {
    window['electronAPI'].onCliLog(callback);
  }

  // Subscribe to shortcut log messages
  onLogShortcut(callback: (msg: string) => void): void {
    window['electronAPI'].onLogShortcut(callback);
  }

  // Send the save settings message to Electron
  sendSettingsSave(): void {
    window['electronAPI'].sendSettingsSave();
  }

  // Subscribe to the log of settings save
  onSettingsSavedLog(callback: (msg: string) => void): void {
    window['electronAPI'].onSettingsSavedLog(callback);
  }

  // Trigger the "serve repo" event
  sendServeRepo(): void {
    window['electronAPI'].sendServeRepo();
  }

  // Subscribe to logs of serve repo
  onServeRepoLog(callback: (msg: string) => void): void {
    window['electronAPI'].onServeRepoLog(callback);
  }
}
