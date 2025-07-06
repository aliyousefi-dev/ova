import { Injectable, EventEmitter, OnDestroy } from '@angular/core';

// Check if the code is running in the Electron environment
declare var window: any;

@Injectable({
  providedIn: 'root',
})
export class ShortcutService implements OnDestroy {
  // EventEmitters for each specific shortcut
  ctrlEPressed: EventEmitter<void> = new EventEmitter<void>();
  ctrlNPressed: EventEmitter<void> = new EventEmitter<void>();
  ctrlOPressed: EventEmitter<void> = new EventEmitter<void>();

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
        this.handleShortcut(message);
      });
    }
  }

  private handleShortcut(message: string) {
    switch (message) {
      case 'Ctrl+E pressed!':
        this.ctrlEPressed.emit();
        break;
      case 'Ctrl+N pressed!':
        this.ctrlNPressed.emit();
        break;
      case 'Ctrl+O pressed!':
        this.ctrlOPressed.emit();
        break;
      default:
        console.log('No specific logic for this shortcut');
        break;
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
