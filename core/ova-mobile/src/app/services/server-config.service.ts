import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class ServerConfigService {
  private serverUrl: string | null = null;

  constructor() {}

  async loadServerUrl(): Promise<void> {
    let { value } = await Preferences.get({ key: 'server_url' });

    if (!value) {
      // Try to get from localStorage
      value = localStorage.getItem('server_url') || null;
    }

    this.serverUrl = value;
  }

  getServerUrl(): string | null {
    return this.serverUrl;
  }
}
