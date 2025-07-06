import { Injectable, EventEmitter, OnDestroy } from '@angular/core';

// Check if the code is running in the Electron environment
declare var window: any;

@Injectable({
  providedIn: 'root',
})
export class ShortcutService implements OnDestroy {
  // Event emitter to notify components when a shortcut is pressed
  shortcutPressed: EventEmitter<string> = new EventEmitter<string>();

  constructor() {
    if (this.isElectron()) {
      this.registerShortcutListeners();
    } else {
      console.warn('Not in Electron environment');
    }
  }

  // Function to check if we're in Electron
  private isElectron(): boolean {
    return (
      typeof window !== 'undefined' && window.IPCBridge // Check for IPCBridge exposure
    );
  }

  private registerShortcutListeners() {
    // Make sure we are in Electron before trying to register listeners
    if (this.isElectron()) {
      // Use IPCBridge to listen for the shortcut
      window.IPCBridge.onShortcutPressed((message: string) => {
        // Emit the shortcut message to components
        this.shortcutPressed.emit(message);
      });
    }
  }

  // Cleanup the listener when the service is destroyed
  ngOnDestroy() {
    if (this.isElectron()) {
      // Remove all listeners for 'log-shortcut'
      window.IPCBridge.removeAllListeners('log-shortcut');
    }
  }
}
