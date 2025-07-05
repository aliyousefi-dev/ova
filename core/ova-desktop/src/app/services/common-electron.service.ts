// common-electron.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  constructor() {}

  // Method to open a folder picker dialog
  pickFolder(): Promise<string | null> {
    console.log('pickFolder called');
    return window['IPCBridge']
      .pickFolder()
      .then((result) => {
        console.log('pickFolder result:', result);
        return result;
      })
      .catch((err) => {
        console.error('pickFolder error:', err);
        throw err;
      });
  }

  // Method to check if a folder exists
  folderExists(folderPath: string): Promise<boolean> {
    console.log('folderExists called with folderPath:', folderPath);
    return window['IPCBridge']
      .folderExists(folderPath)
      .then((exists) => {
        console.log(`folderExists result for ${folderPath}:`, exists);
        return exists;
      })
      .catch((err) => {
        console.error('folderExists error:', err);
        throw err;
      });
  }

  // Method to handle path joining using IPC
  joinPaths(folderPath: string, folderName: string): Promise<string> {
    console.log(
      `Calling joinPaths with: folderPath=${folderPath}, folderName=${folderName}`
    );
    return window['IPCBridge']
      .joinPaths(folderPath, folderName)
      .then((joinedPath) => {
        console.log('joinPaths result:', joinedPath);
        return joinedPath;
      })
      .catch((err) => {
        console.error('joinPaths error:', err);
        throw err;
      });
  }

  // Method to save repository info
  saveRepositoryInfo(metadata: any): Promise<void> {
    console.log('saveRepositoryInfo called with metadata:', metadata);
    return window['IPCBridge']
      .saveRepositoryInfo(metadata)
      .then(() => {
        console.log('saveRepositoryInfo completed successfully');
      })
      .catch((err) => {
        console.error('saveRepositoryInfo error:', err);
        throw err;
      });
  }

  // Method to load repository info
  loadRepositoryInfo(): Promise<any> {
    console.log('loadRepositoryInfo called');
    return window['IPCBridge']
      .loadRepositoryInfo()
      .then((data) => {
        console.log('loadRepositoryInfo result:', data);
        return data;
      })
      .catch((err) => {
        console.error('loadRepositoryInfo error:', err);
        throw err;
      });
  }

  // Separate methods for window controls
  minimizeWindow(): void {
    console.log('minimizeWindow called');
    window['IPCBridge'].windowControl('minimize');
  }

  maximizeWindow(): void {
    console.log('maximizeWindow called');
    window['IPCBridge'].windowControl('maximize');
  }

  closeWindow(): void {
    console.log('closeWindow called');
    window['IPCBridge'].windowControl('close');
  }
}
