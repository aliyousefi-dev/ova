import { Component, Input, OnInit } from '@angular/core';
import {
  VideoMarker,
  MarkerApiService,
} from '../../../services/api/chapter-api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-marker-edit-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './marker-edit-panel.component.html',
})
export class MarkerEditPanelComponent implements OnInit {
  @Input() videoId!: string;

  markers: VideoMarker[] = [];
  loading = false;
  saving = false;

  readonly RemoveIcon = X;

  globalError: string | null = null;
  markerErrors: { [key: number]: { timestamp?: string; title?: string } } = {};
  successMessage: string | null = null;

  constructor(private markerApi: MarkerApiService) {}

  ngOnInit() {
    this.fetchMarkers();
  }

  fetchMarkers() {
    if (!this.videoId) return;
    this.loading = true;
    this.globalError = null;
    this.markerErrors = {};

    this.markerApi.getMarkers(this.videoId).subscribe({
      next: (res) => {
        const raw = res.data.markers ?? [];
        this.markers = raw.map((m) => ({
          timestamp: m.timestamp,
          title: m.title,
        }));
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.globalError = err.error?.message || 'Failed to load markers.';
        this.loading = false;
      },
    });
  }

  addMarker() {
    const newTimestamp =
      this.markers.length > 0
        ? Math.max(0, this.markers[this.markers.length - 1].timestamp + 20)
        : 0;
    this.markers.push({ timestamp: newTimestamp, title: '' });
    this.validateMarker(
      this.markers[this.markers.length - 1],
      this.markers.length - 1
    );
  }

  removeMarker(index: number) {
    this.markers.splice(index, 1);
    delete this.markerErrors[index];
    this.clearGlobalErrorsIfNoMarkerErrors();
  }

  validateMarker(marker: VideoMarker, index: number): boolean {
    let isValid = true;
    const errors: { timestamp?: string; title?: string } = {};

    if (typeof marker.timestamp !== 'number' || isNaN(marker.timestamp)) {
      errors.timestamp = 'Timestamp must be a number.';
      isValid = false;
    } else if (marker.timestamp < 0) {
      errors.timestamp = 'Timestamp cannot be negative.';
      isValid = false;
    } else if (
      index > 0 &&
      marker.timestamp <= this.markers[index - 1].timestamp
    ) {
      errors.timestamp = 'Timestamp must be after previous marker.';
      isValid = false;
    }

    if (!marker.title || marker.title.trim() === '') {
      errors.title = 'Title cannot be empty.';
      isValid = false;
    }

    if (Object.keys(errors).length > 0) {
      this.markerErrors[index] = errors;
    } else {
      delete this.markerErrors[index];
    }
    return isValid;
  }

  validateAllMarkers(): boolean {
    this.markerErrors = {};
    let allValid = true;
    this.markers.forEach((marker, index) => {
      if (!this.validateMarker(marker, index)) {
        allValid = false;
      }
    });
    return allValid;
  }

  saveMarkers() {
    if (!this.videoId) {
      this.globalError = 'Video ID is missing. Cannot save markers.';
      return;
    }

    if (!this.validateAllMarkers()) {
      this.globalError = 'Please fix errors in individual marker fields.';
      return;
    }

    this.saving = true;
    this.globalError = null;
    this.successMessage = null;

    const markersToSend: VideoMarker[] = this.markers.map((m) => ({
      timestamp: m.timestamp,
      title: m.title.trim(),
    }));

    this.markerApi.updateMarkers(this.videoId, markersToSend).subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = 'Markers saved successfully!';
        this.globalError = null;
        this.markerErrors = {};
        this.fetchMarkers();
        setTimeout(() => (this.successMessage = null), 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.saving = false;
        this.globalError =
          err.error?.message || 'Failed to save markers. Please try again.';
        console.error('Save markers error:', err);
      },
    });
  }

  onTimestampInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value;
    const seconds = this.displayToSeconds(rawValue);
    this.markers[index].timestamp = seconds;
    this.validateMarker(this.markers[index], index);
    this.clearGlobalErrorsIfNoMarkerErrors();
  }

  onTitleInput(event: Event, index: number) {
    this.validateMarker(this.markers[index], index);
    this.clearGlobalErrorsIfNoMarkerErrors();
  }

  secondsToDisplay(seconds: number): string {
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0)
      return '00:00:00';
    const totalSeconds = Math.floor(seconds);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    if (h > 0) {
      return [
        h.toString().padStart(2, '0'),
        m.toString().padStart(2, '0'),
        s.toString().padStart(2, '0'),
      ].join(':');
    } else {
      return [
        m.toString().padStart(2, '0'),
        s.toString().padStart(2, '0'),
      ].join(':');
    }
  }

  displayToSeconds(displayString: string): number {
    if (!displayString) return 0;

    let totalSeconds = 0;
    const parts = displayString.trim().split(':');

    let secPart = parts[parts.length - 1];
    const milliParts = secPart.split('.');
    if (milliParts.length > 1) {
      secPart = milliParts[0];
      const ms = parseInt(milliParts[1], 10);
      if (!isNaN(ms)) {
        totalSeconds += ms / 1000.0;
      }
    }

    const numericParts = parts
      .slice(0, parts.length - 1)
      .concat(secPart)
      .map(Number);

    if (numericParts.length === 3) {
      totalSeconds +=
        numericParts[0] * 3600 + numericParts[1] * 60 + numericParts[2];
    } else if (numericParts.length === 2) {
      totalSeconds += numericParts[0] * 60 + numericParts[1];
    } else if (numericParts.length === 1) {
      totalSeconds += numericParts[0];
    } else {
      return NaN;
    }
    return totalSeconds;
  }

  hasMarkerErrors(): boolean {
    return Object.keys(this.markerErrors).length > 0;
  }

  private clearGlobalErrorsIfNoMarkerErrors(): void {
    if (!this.hasMarkerErrors()) {
      this.globalError = null;
    }
  }
}
