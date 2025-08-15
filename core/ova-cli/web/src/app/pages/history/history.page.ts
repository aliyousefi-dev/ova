import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { GalleryInfiniteFetcher } from '../../components/manager/gallery-infinite-fetcher/gallery-infinite-fetcher.component';
import { GalleryPageFetcher } from '../../components/manager/gallery-page-fetcher/gallery-page-fetcher.component';
import { UserSettingsService } from '../../services/user-settings.service';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GalleryInfiniteFetcher,
    GalleryPageFetcher,
  ],
  templateUrl: './history.page.html',
})
export class HistoryPage implements OnInit, OnDestroy {
  infiniteMode: boolean = false; // Bind to Infinite Fetch checkbox
  isMiniView: boolean = true; // Bind to Mini View checkbox
  previewPlayback: boolean = false; // Bind to Preview Playback checkbox

  constructor(private userSettingsService: UserSettingsService) {}

  ngOnInit(): void {
    // Get the initial infinite mode status from the service
    this.infiniteMode = this.userSettingsService.isGalleryInInfiniteMode();

    // Get the initial mini view mode status from the service (if needed)
    this.isMiniView = this.userSettingsService.isGalleryInMiniViewMode();

    // Get the initial preview playback mode status from the service
    this.previewPlayback = this.userSettingsService.isPreviewPlaybackEnabled();
  }

  ngOnDestroy(): void {}

  // Toggle the infinite mode and update the localStorage
  toggleInfiniteMode(): void {
    this.infiniteMode = !this.infiniteMode;
    this.userSettingsService.setGalleryInfiniteMode(this.infiniteMode);
  }

  // Toggle the mini view mode and update the localStorage
  toggleMiniView(): void {
    this.isMiniView = !this.isMiniView;
    this.userSettingsService.setGalleryMiniViewMode(this.isMiniView);
  }

  // Toggle the preview playback mode and update the localStorage
  togglePreviewPlayback(): void {
    this.previewPlayback = !this.previewPlayback;
    this.userSettingsService.setPreviewPlaybackEnabled(this.previewPlayback);
  }
}
