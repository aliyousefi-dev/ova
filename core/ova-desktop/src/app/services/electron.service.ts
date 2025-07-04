import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  constructor() {}

  // Method to run the CLI with arguments
  runCli(args: string[]): Promise<{ success: boolean; error?: string }> {
    return window['electronAPI'].OvaCli(args);
  }

  // Method to open a folder picker dialog
  pickFolder(): Promise<string | null> {
    return window['electronAPI'].pickFolder();
  }

  // Separate methods for window controls
  minimizeWindow(): void {
    window['electronAPI'].windowControl('minimize');
  }

  maximizeWindow(): void {
    window['electronAPI'].windowControl('maximize');
  }

  closeWindow(): void {
    console.log('caaled');
    window['electronAPI'].windowControl('close');
  }
}
