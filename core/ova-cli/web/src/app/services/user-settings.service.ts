import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserSettingsService {
  getGalleryViewMode(): string | null {
    try {
      const galleryViewMode = localStorage.getItem('galleryIsMini');
      if (!galleryViewMode) {
        console.warn(
          'No gallery view mode found in localStorage. Playlist order updates will be disabled.'
        );
        return null;
      }
      return galleryViewMode;
    } catch (error) {
      console.error('Error reading gallery view mode:', error);
      return null;
    }
  }

  setGalleryViewMode(mode: string) {
    try {
      localStorage.setItem('galleryIsMini', mode);
    } catch (error) {
      console.error('Error setting gallery view mode:', error);
    }
  }
}
