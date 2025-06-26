import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavBarComponent } from '../../components/common/navbar/navbar.component';
import { VideoData } from '../../data-types/video-data';
import { VideoApiService } from '../../services/api/video-api.service';
import { SavedApiService } from '../../services/api/saved-api.service';
import { PlaylistModalComponent } from '../../components/playlist/playlist-modal/playlist-modal.component';
import { PlaylistAPIService } from '../../services/api/playlist-api.service';
import { WatchedApiService } from '../../services/api/watched-api.service';
import { VidstackPlayerComponent } from '../../components/video-player/vidstack-player/vidstack-player.component';
import { DefaultVideoPlayerComponent } from '../../components/video-player/default-video-player/default-video-player.component';
import { MarkerApiService } from '../../services/api/chapter-api.service';

// Updated: Import new child components
import { VideoActionBarComponent } from './panels/video-action-bar.component'; // Path assuming it's in the same directory as watch.page.ts
import { VideoMetadataPanelComponent } from './panels/video-metadata-panel.component'; // Path assuming it's in the same directory as watch.page.ts
import { TagManagementPanelComponent } from './panels/tag-management-panel.component';
import { SimilarVideosPanelComponent } from './panels/similar-videos-panel.component';
import { MarkerEditPanelComponent } from './panels/marker-edit-panel.component';
import { VideoTagsPanelComponent } from './panels/video-tags-panel.component';

@Component({
  selector: 'app-watch',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavBarComponent,
    PlaylistModalComponent,
    VidstackPlayerComponent,
    DefaultVideoPlayerComponent,
    // Updated: Add new child components and remove the old VideoDetailsComponent
    VideoActionBarComponent,
    VideoMetadataPanelComponent,
    TagManagementPanelComponent,
    SimilarVideosPanelComponent,
    MarkerEditPanelComponent,
    VideoTagsPanelComponent,
  ],
  templateUrl: './watch.page.html',
  styleUrls: ['./watch.page.css'],
})
export class WatchPage implements AfterViewInit {
  loading = true;
  error = false;
  videoId: string | null = null;
  video!: VideoData;

  isSaved = false;
  loadingSavedVideo = false;
  username = '';

  playlistModalVisible = false;
  playlists: { title: string; slug: string; checked: boolean }[] = [];
  originalPlaylists: { title: string; slug: string; checked: boolean }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private savedapi: SavedApiService,
    public videoapi: VideoApiService,
    private playlistapi: PlaylistAPIService,
    private watchedapi: WatchedApiService,
    private markerapi: MarkerApiService,
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

  ngAfterViewInit(): void {
    window.scrollTo(0, 0);
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
        this.isSaved = res.saved.includes(this.videoId!);
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
              this.playlistapi
                .getUserPlaylistBySlug(this.username, playlist.slug)
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
        this.playlistapi
          .addVideoToPlaylist(this.username, playlist.slug, this.video.videoId)
          .subscribe();
      } else if (!playlist.checked && original.checked) {
        this.playlistapi
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
