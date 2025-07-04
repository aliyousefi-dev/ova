import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  constructor() {}

  // Method to open a folder picker dialog
  pickFolder(): Promise<string | null> {
    return window['IPCBridge'].pickFolder();
  }

  // Method to check if a folder exists
  folderExists(folderPath: string): Promise<boolean> {
    return window['IPCBridge'].folderExists(folderPath);
  }

  // Method to handle path joining using IPC
  joinPaths(folderPath: string, folderName: string): Promise<string> {
    console.log(`Calling joinPaths with: ${folderPath}, ${folderName}`); // Log to confirm the call is being made
    return window['IPCBridge'].joinPaths(folderPath, folderName); // Now returns a Promise
  }

  // Method to save repository info
  saveRepositoryInfo(metadata: any): Promise<void> {
    return window['IPCBridge'].saveRepositoryInfo(metadata);
  }

  // Method to load repository info
  loadRepositoryInfo(): Promise<any> {
    return window['IPCBridge'].loadRepositoryInfo();
  }

  // Separate methods for window controls
  minimizeWindow(): void {
    window['IPCBridge'].windowControl('minimize');
  }

  maximizeWindow(): void {
    window['IPCBridge'].windowControl('maximize');
  }

  closeWindow(): void {
    console.log('called');
    window['IPCBridge'].windowControl('close');
  }
}
