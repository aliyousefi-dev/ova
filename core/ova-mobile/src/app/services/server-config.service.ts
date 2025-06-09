import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class ServerConfigService {
  private serverUrl: string | null = null;

  constructor() {}

  async loadServerUrl(): Promise<void> {
    const { value } = await Preferences.get({ key: 'server_url' });
    this.serverUrl = value;
  }

  getServerUrl(): string | null {
    return this.serverUrl;
  }
}
