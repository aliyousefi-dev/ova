import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UtilsService {
  getUsername(): string | null {
    try {
      const username = localStorage.getItem('username');
      if (!username) {
        console.warn(
          'No username found in localStorage. Playlist order updates will be disabled.'
        );
        return null;
      }
      return username;
    } catch (error) {
      console.error('Error reading username:', error);
      return null;
    }
  }
}
