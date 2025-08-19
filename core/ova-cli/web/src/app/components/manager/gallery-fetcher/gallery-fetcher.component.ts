import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GalleryInfiniteFetcher } from '../gallery-infinite-fetcher/gallery-infinite-fetcher.component';
import { GalleryPageFetcher } from '../gallery-page-fetcher/gallery-page-fetcher.component';
import { UserSettingsService } from '../../../services/user-settings.service';
import { Input } from '@angular/core';

@Component({
  selector: 'app-gallery-fetcher',
  standalone: true,
  imports: [
    CommonModule,
    GalleryInfiniteFetcher,
    GalleryPageFetcher,
    FormsModule,
  ],
  templateUrl: './gallery-fetcher.component.html',
})
export class GalleryFetcherComponent implements OnInit {
  @Input() routeCategory: string = 'recent';
  @Input() slug: string = '';

  loading = true;
  username: string | null = null;
  infiniteMode = true; // Default to infinite mode, you can change based on preference
  previewPlayback = true; // Default for preview playback
  isMiniView = false; // Default to full view

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userSettingsService: UserSettingsService
  ) {}

  ngOnInit() {
    this.username = localStorage.getItem('username');
    if (!this.username) {
      this.router.navigate(['/login']);
      return;
    }

    // Get the initial infinite mode status from the service
    this.infiniteMode = this.userSettingsService.isGalleryInInfiniteMode();

    // Get the initial mini view mode status from the service (if needed)
    this.isMiniView = this.userSettingsService.isGalleryInMiniViewMode();

    // Get the initial preview playback mode status from the service
    this.previewPlayback = this.userSettingsService.isPreviewPlaybackEnabled();
  }

  toggleInfiniteMode() {
    this.infiniteMode = !this.infiniteMode;
    this.userSettingsService.setGalleryInfiniteMode(this.infiniteMode);
  }

  togglePreviewPlayback() {
    this.previewPlayback = !this.previewPlayback;
    this.userSettingsService.setPreviewPlaybackEnabled(this.previewPlayback);
  }

  toggleMiniView() {
    this.isMiniView = !this.isMiniView;
    this.userSettingsService.setGalleryMiniViewMode(this.isMiniView);
  }
}
