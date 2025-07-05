import { Injectable, EventEmitter } from '@angular/core';

declare var window: any; // This is needed to access Electron's `window` object for IPC

@Injectable({
  providedIn: 'root', // This makes the service globally available
})
export class ShortcutService {
  // Event emitter to notify components when a shortcut is pressed
  shortcutPressed: EventEmitter<string> = new EventEmitter<string>();

  constructor() {
    this.registerShortcutListeners();
  }

  private registerShortcutListeners() {
    // Specify the type for 'message' as 'string'
    window.electron.ipcRenderer.on(
      'log-shortcut',
      (event: any, message: string) => {
        console.log('Shortcut pressed:', message);
        // Emit the shortcut message to components
        this.shortcutPressed.emit(message);
      }
    );
  }

  // Cleanup the listener when the service is destroyed
  ngOnDestroy() {
    window.electron.ipcRenderer.removeAllListeners('log-shortcut');
  }
}
