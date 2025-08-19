import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoData } from '../../data-types/video-data';
import { VideoApiService } from '../../services/ova-backend/video-api.service';
import { SavedApiService } from '../../services/ova-backend/saved-api.service';
import { PlaylistAPIService } from '../../services/ova-backend/playlist-api.service';
import { WatchedApiService } from '../../services/ova-backend/watched-api.service';
import { VidstackPlayerComponent } from '../../components/media-player/vidstack-player/vidstack-player.component';
import { DefaultVideoPlayerComponent } from '../../components/media-player/default-video-player/default-video-player.component';
import { MarkerApiService } from '../../services/ova-backend/marker-api.service';

// Updated: Import new child components
import { VideoTitleBarComponent } from './panels/video-title-bar.component'; // Path assuming it's in the same directory as watch.page.ts
import { SimilarVideosPanelComponent } from './panels/similar-videos-panel.component';
import { VideoActionBarComponent } from './panels/video-action-bar.component';
import { VideoTagsPanelComponent } from './panels/video-tags-panel.component';
import { VideoAdminTabsComponent } from './panels/video-admin-tabs.component';
import { VideoCommentPanelComponent } from './panels/video-comment-panel.component';
import { PlaylistContentAPIService } from '../../services/ova-backend/playlist-content-api.service';

import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-watch',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    VidstackPlayerComponent,
    DefaultVideoPlayerComponent,
    // Updated: Add new child components and remove the old VideoDetailsComponent
    VideoTitleBarComponent,
    SimilarVideosPanelComponent,
    VideoAdminTabsComponent,
    VideoTagsPanelComponent,
    VideoActionBarComponent,
    VideoTitleBarComponent,
    VideoCommentPanelComponent,
  ],
  templateUrl: './watch.page.html',
  styleUrls: ['./watch.page.css'],
})
export class WatchPage implements AfterViewInit {
  @ViewChild('vidstackPlayer') vidstackPlayer!: VidstackPlayerComponent;
  @ViewChild('adminTabs') adminTabs!: VideoAdminTabsComponent;

  loading = true;
  error = false;
  videoId: string | null = null;
  video!: VideoData;

  isSaved = false;
  loadingSavedVideo = false;
  username = '';

  selectedTab: 'tag' | 'marker' = 'tag'; // default

  playlistModalVisible = false;
  playlists: { title: string; slug: string; checked: boolean }[] = [];
  originalPlaylists: { title: string; slug: string; checked: boolean }[] = [];

  onAddMarkerClicked() {
    const currentTime = this.vidstackPlayer.getCurrentTime();
    console.log('Current Time:', currentTime);

    this.adminTabs.addMarkerBySeconds(currentTime);
  }

  getCurrentTimeFromPlayer = () => this.vidstackPlayer.getCurrentTime();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private savedapi: SavedApiService,
    public videoapi: VideoApiService,
    private playlistapi: PlaylistAPIService,
    private watchedapi: WatchedApiService,
    private markerapi: MarkerApiService,
    private playlistContentAPI: PlaylistContentAPIService,
    private cd: ChangeDetectorRef
  ) {
    this.videoId = this.route.snapshot.paramMap.get('videoId');

    if (this.videoId) {
      this.fetchVideo(this.videoId);
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  formatTime(seconds: number | null | undefined): string {
    if (seconds == null || isNaN(seconds)) return '–';

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  ngAfterViewInit(): void {
    window.scrollTo(0, 0);

    // Load tab from localStorage
    const savedTab = localStorage.getItem('watch-selected-tab');
    if (savedTab === 'marker' || savedTab === 'tag') {
      this.selectedTab = savedTab;
    }
  }

  fetchVideo(videoId: string) {
    this.loading = true;
    this.error = false;
    this.videoapi.getVideoById(videoId).subscribe({
      next: (response) => {
        this.video = response.data;
        (window as any).video = this.video; // Consider removing this if not debugging
        this.loading = false;
        this.username = localStorage.getItem('username') ?? '';
        this.checkIfVideoSaved();

        if (this.username && this.videoId) {
          this.watchedapi
            .addUserWatched(this.username, this.videoId)
            .subscribe({
              next: () => {
                console.log('Video marked as watched!');
              },
              error: (err) => {
                console.error('Failed to mark video as watched:', err);
              },
            });
        }
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  navigateToVideo(videoId: string) {
    if (videoId === this.videoId) return;

    // Reset states for new video loading
    this.loading = true;
    this.error = false;

    this.router.navigate(['/watch', videoId], { replaceUrl: true }).then(() => {
      this.videoId = videoId;
      this.fetchVideo(videoId);
      window.scrollTo(0, 0);
    });
  }

  persistTab(tab: 'tag' | 'marker') {
    localStorage.setItem('watch-selected-tab', tab);
  }

  get videoUrl(): string {
    return this.videoapi.getStreamUrl(this.video.videoId);
  }

  get thumbnailUrl(): string {
    return this.videoapi.getThumbnailUrl(this.video.videoId);
  }

  get storyboardVttUrl(): string {
    return this.videoapi.getStoryboardVttUrl(this.video.videoId);
  }

  get markerFileUrl(): string {
    return this.markerapi.getMarkerFileUrl(this.video.videoId);
  }

  checkIfVideoSaved() {
    if (!this.username || !this.videoId) return;

    this.savedapi.getUserSaved(this.username).subscribe({
      next: (res) => {
        this.isSaved = res.data.videoIds.includes(this.videoId!);
      },
      error: () => {
        this.isSaved = false;
      },
    });
  }

  toggleSaved() {
    if (!this.username || !this.videoId) return;

    this.loadingSavedVideo = true;

    const done = () => (this.loadingSavedVideo = false);

    if (this.isSaved) {
      this.savedapi.removeUserSaved(this.username, this.videoId).subscribe({
        next: () => {
          this.isSaved = false;
          done();
        },
        error: () => done(),
      });
    } else {
      this.savedapi.addUserSaved(this.username, this.videoId).subscribe({
        next: () => {
          this.isSaved = true;
          done();
        },
        error: () => done(),
      });
    }
  }

  addToPlaylist(event: MouseEvent) {
    event.stopPropagation();
    if (!this.username || !this.video) return;

    this.playlistapi.getUserPlaylists(this.username).subscribe((response) => {
      const pls = response.data.playlists;
      const checkList = pls.map((p) => ({ ...p, checked: false }));

      Promise.all(
        checkList.map(
          (playlist) =>
            new Promise<void>((resolve) => {
              this.playlistContentAPI
                .fetchPlaylistContent(this.username, playlist.slug)
                .subscribe((plData) => {
                  playlist.checked = plData.data.videoIds.includes(
                    this.video.videoId
                  );
                  resolve();
                });
            })
        )
      ).then(() => {
        this.playlists = checkList;
        this.originalPlaylists = checkList.map((p) => ({ ...p }));
        this.playlistModalVisible = true;
        this.cd.detectChanges();
      });
    });
  }

  closePlaylistModal(
    updatedPlaylists: { title: string; slug: string; checked: boolean }[]
  ) {
    this.playlistModalVisible = false;
    if (!this.username || !this.video) return;

    updatedPlaylists.forEach((playlist) => {
      const original = this.originalPlaylists.find(
        (p) => p.slug === playlist.slug
      );
      if (!original) return;

      if (playlist.checked && !original.checked) {
        this.playlistContentAPI
          .addVideoToPlaylist(this.username, playlist.slug, this.video.videoId)
          .subscribe();
      } else if (!playlist.checked && original.checked) {
        this.playlistContentAPI
          .deleteVideoFromPlaylist(
            this.username,
            playlist.slug,
            this.video.videoId
          )
          .subscribe();
      }
    });
  }
}
