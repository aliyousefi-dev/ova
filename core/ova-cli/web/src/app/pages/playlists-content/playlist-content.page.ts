import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GalleryInfiniteFetcher } from '../../components/manager/gallery-infinite-fetcher/gallery-infinite-fetcher.component';
import { GalleryPageFetcher } from '../../components/manager/gallery-page-fetcher/gallery-page-fetcher.component'; // Assuming this is the other component

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [
    CommonModule,
    GalleryInfiniteFetcher,
    GalleryPageFetcher,
    FormsModule,
  ],
  templateUrl: './playlist-content.page.html',
})
export class PlaylistContentPage implements OnInit {
  playlistTitle = '';
  loading = true;
  username: string | null = null;
  infiniteMode = true; // Default to infinite mode, you can change based on preference
  previewPlayback = true; // Default for preview playback
  isMiniView = false; // Default to full view

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.username = localStorage.getItem('username');
    if (!this.username) {
      this.router.navigate(['/login']);
      return;
    }

    // Assuming playlist title is passed as route param 'title'
    this.route.paramMap.subscribe((params) => {
      const title = params.get('title');
      if (title) {
        this.playlistTitle = title;
        this.loading = false; // No need for loading anymore, gallery will handle it
      } else {
        this.router.navigate(['/playlists']);
      }
    });
  }

  toggleInfiniteMode() {
    this.infiniteMode = !this.infiniteMode;
  }

  togglePreviewPlayback() {
    this.previewPlayback = !this.previewPlayback;
  }

  toggleMiniView() {
    this.isMiniView = !this.isMiniView;
  }
}
