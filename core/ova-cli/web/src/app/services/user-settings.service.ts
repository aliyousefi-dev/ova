import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserSettingsService {
  private readonly GALLERY_INFINITE_MODE_KEY = 'galleryIsInfinite';
  private readonly GALLERY_MINI_VIEW_MODE_KEY = 'galleryIsMiniView';
  private readonly GALLERY_PREVIEW_PLAYBACK_KEY = 'galleryIsPreviewPlayback'; // New key for Preview Playback

  // Get the gallery infinite mode status (true or false)
  isGalleryInInfiniteMode(): boolean {
    try {
      const mode = localStorage.getItem(this.GALLERY_INFINITE_MODE_KEY);
      return mode === 'true'; // returns true if 'true', false otherwise
    } catch (error) {
      console.error('Error reading infinite mode status:', error);
      return false; // default to false if there is an error
    }
  }

  // Set the gallery to infinite mode or not (boolean)
  setGalleryInfiniteMode(isInfinite: boolean): void {
    try {
      localStorage.setItem(this.GALLERY_INFINITE_MODE_KEY, String(isInfinite));
    } catch (error) {
      console.error('Error setting infinite mode:', error);
    }
  }

  // Get the gallery mini view mode status (true or false)
  isGalleryInMiniViewMode(): boolean {
    try {
      const mode = localStorage.getItem(this.GALLERY_MINI_VIEW_MODE_KEY);
      return mode === 'true'; // returns true if 'true', false otherwise
    } catch (error) {
      console.error('Error reading mini view mode status:', error);
      return true; // default to true if there is an error (mini view is enabled by default)
    }
  }

  // Set the gallery to mini view mode or not (boolean)
  setGalleryMiniViewMode(isMiniView: boolean): void {
    try {
      localStorage.setItem(this.GALLERY_MINI_VIEW_MODE_KEY, String(isMiniView));
    } catch (error) {
      console.error('Error setting mini view mode:', error);
    }
  }

  // Get the gallery preview playback mode status (true or false)
  isPreviewPlaybackEnabled(): boolean {
    try {
      const mode = localStorage.getItem(this.GALLERY_PREVIEW_PLAYBACK_KEY);
      return mode === 'true'; // returns true if 'true', false otherwise
    } catch (error) {
      console.error('Error reading preview playback status:', error);
      return false; // default to false if there is an error
    }
  }

  // Set the gallery to preview playback mode or not (boolean)
  setPreviewPlaybackEnabled(isPreview: boolean): void {
    try {
      localStorage.setItem(
        this.GALLERY_PREVIEW_PLAYBACK_KEY,
        String(isPreview)
      );
    } catch (error) {
      console.error('Error setting preview playback mode:', error);
    }
  }
}
