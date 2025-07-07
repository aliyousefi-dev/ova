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

  // NEW: Method to show an item in its containing folder and highlight it
  showItemInFolder(fullPath: string): Promise<boolean> {
    console.log('showItemInFolder called with fullPath:', fullPath);
    return window['IPCBridge']
      .showItemInFolder(fullPath)
      .then((success) => {
        console.log(`showItemInFolder result for ${fullPath}:`, success);
        return success;
      })
      .catch((err) => {
        console.error('showItemInFolder error:', err);
        throw err;
      });
  }

  // NEW: Method to get the directory name from a full path
  getDirectoryName(fullPath: string): Promise<string | null> {
    console.log('getDirectoryName called with fullPath:', fullPath);
    return window['IPCBridge']
      .getDirectoryName(fullPath)
      .then((dirName) => {
        console.log(`getDirectoryName result for ${fullPath}:`, dirName);
        return dirName;
      })
      .catch((err) => {
        console.error('getDirectoryName error:', err);
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
