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

  // Separate methods for window controls
  minimizeWindow(): void {
    window['IPCBridge'].windowControl('minimize');
  }

  maximizeWindow(): void {
    window['IPCBridge'].windowControl('maximize');
  }

  closeWindow(): void {
    console.log('caaled');
    window['IPCBridge'].windowControl('close');
  }
}
