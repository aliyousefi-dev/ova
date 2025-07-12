import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import {
  VideoMarker,
  MarkerApiService,
} from '../../../services/api/marker-api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-marker-edit-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './marker-edit-panel.component.html',
})
export class MarkerEditPanelComponent implements OnInit {
  @Input() videoId!: string;
  @Output() addMarkerClicked = new EventEmitter<void>();

  markers: VideoMarker[] = [];
  originalMarkers: VideoMarker[] = [];
  loading = false;
  saving = false;
  globalError: string | null = null;
  successMessage: string | null = null;
  markerErrors: Record<
    number,
    Partial<Record<'hour' | 'minute' | 'second' | 'title', string>>
  > = {};

  constructor(private markerApi: MarkerApiService) {}

  ngOnInit() {
    this.fetchMarkers();
  }

  private toSeconds({ hour = 0, minute = 0, second = 0 }: VideoMarker): number {
    return hour * 3600 + minute * 60 + second;
  }

  private fromSeconds(total: number): VideoMarker {
    const hour = Math.floor(total / 3600);
    const minute = Math.floor((total % 3600) / 60);
    const second = Math.floor(total % 60);
    return { hour, minute, second, title: '' };
  }

  fetchMarkers() {
    if (!this.videoId) return;
    this.loading = true;
    this.markerApi.getMarkers(this.videoId).subscribe({
      next: (res) => {
        this.markers = (res.data.markers ?? []).map((m) => ({
          hour: +m.hour,
          minute: +m.minute,
          second: +m.second,
          title: m.title,
        }));

        // Keep deep copy of original markers for reset
        this.originalMarkers = this.markers.map((m) => ({ ...m }));

        this.loading = false;
        this.validateAllMarkers();
      },
      error: (err: HttpErrorResponse) => {
        this.globalError = err.error?.message || 'Failed to load markers.';
        this.loading = false;
      },
    });
  }

  addMarker() {
    this.addMarkerClicked.emit();
  }

  addMarkerBySeconds(totalSeconds: number) {
    const marker = this.fromSeconds(totalSeconds);
    this.markers = [...this.markers, { ...marker, title: '' }];
    this.validateMarker(this.markers.length - 1);
  }

  removeMarker(index: number) {
    this.markers.splice(index, 1);
    this.revalidateAll();
    this.successMessage = 'Marker removed locally. Click Save to confirm.';
    setTimeout(() => (this.successMessage = null), 3000);
  }

  saveMarkers() {
    if (!this.validateAllMarkers()) {
      this.globalError = 'Fix all errors before saving.';
      return;
    }
    this.saving = true;
    this.markerApi.updateMarkers(this.videoId, this.markers).subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = 'Markers saved!';
        // Update originalMarkers to current saved markers
        this.originalMarkers = this.markers.map((m) => ({ ...m }));
        setTimeout(() => (this.successMessage = null), 3000);
        this.fetchMarkers();
      },
      error: (err) => {
        this.saving = false;
        this.globalError = err.error?.message || 'Save failed.';
      },
    });
  }

  validateMarker(index: number): boolean {
    const m = this.markers[index];
    const errors: (typeof this.markerErrors)[number] = {};
    let valid = true;

    if (m.hour == null || m.hour < 0) errors.hour = 'Hour ≥ 0';
    if (m.minute == null || m.minute < 0 || m.minute >= 60)
      errors.minute = '0 ≤ Min < 60';
    if (m.second == null || m.second < 0 || m.second >= 60)
      errors.second = '0 ≤ Sec < 60';
    if (!m.title?.trim()) errors.title = 'Title required';

    if (Object.keys(errors).length) valid = false;
    this.markerErrors[index] = errors;
    return valid;
  }

  validateAllMarkers(): boolean {
    return this.markers.every((_, i) => this.validateMarker(i));
  }

  revalidateAll() {
    this.markerErrors = {};
    this.validateAllMarkers();
    if (!this.hasMarkerErrors()) this.globalError = null;
  }

  hasMarkerErrors(): boolean {
    return Object.values(this.markerErrors).some(
      (err) => Object.keys(err).length
    );
  }

  onTimeInput(index: number) {
    this.validateMarker(index);
    if (!this.hasMarkerErrors()) this.globalError = null;
  }

  onTitleInput(_: Event, index: number) {
    this.validateMarker(index);
    if (!this.hasMarkerErrors()) this.globalError = null;
  }

  // Detect if a marker has been modified compared to original
  isMarkerModified(index: number): boolean {
    const original = this.originalMarkers[index];
    const current = this.markers[index];
    if (!original || !current) return false;
    return (
      original.hour !== current.hour ||
      original.minute !== current.minute ||
      original.second !== current.second ||
      original.title !== current.title
    );
  }

  resetMarker(index: number) {
    if (!this.originalMarkers[index]) return;
    this.markers[index] = { ...this.originalMarkers[index] };
    this.validateMarker(index);
    this.revalidateAll();
  }

  confirmAndDeleteAllMarkers() {
    if (
      confirm(
        'Are you sure you want to delete ALL markers for this video? This action cannot be undone.'
      )
    ) {
      this.deleteAllMarkers();
    }
  }

  private deleteAllMarkers() {
    if (!this.videoId) return;
    this.loading = true;
    this.markerApi.deleteAllMarkers(this.videoId).subscribe({
      next: () => {
        this.markers = [];
        this.originalMarkers = [];
        this.loading = false;
        this.successMessage = 'All markers deleted!';
        setTimeout(() => (this.successMessage = null), 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.globalError =
          err.error?.message || 'Failed to delete all markers.';
        this.loading = false;
      },
    });
  }
}
