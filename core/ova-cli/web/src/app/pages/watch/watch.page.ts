import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavBarComponent } from '../../components/common/navbar/navbar.component';
import { VideoData } from '../../data-types/video-data';
import { VideoApiService } from '../../services/api/video-api.service';
import { TagChipComponent } from '../../components/video/tag-chip/tag-chip.component';
import { SavedApiService } from '../../services/api/saved-api.service';
import { PlaylistModalComponent } from '../../components/playlist/playlist-modal/playlist-modal.component'; // Import PlaylistModalComponent
import { PlaylistAPIService } from '../../services/api/playlist-api.service'; // Import PlaylistAPIService
import { WatchedApiService } from '../../services/api/watched-api.service'; // Import WatchedApiService
import { VidstackPlayerComponent } from '../../components/video-player/vidstack-player/vidstack-player.component';
import { DefaultVideoPlayerComponent } from '../../components/video-player/default-video-player/default-video-player.component';

@Component({
  selector: 'app-watch',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavBarComponent,
    TagChipComponent,
    PlaylistModalComponent,
    VidstackPlayerComponent,
    DefaultVideoPlayerComponent,
  ],
  templateUrl: './watch.page.html',
  styleUrls: ['./watch.page.css'],
})
export class WatchPage implements AfterViewInit {
  @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;

  loading = true;
  error = false;
  videoId: string | null = null;
  video!: VideoData;

  newTag: string = '';
  updatingTags = false;
  tagUpdateError = false;

  isSaved = false;
  LoadingSavedVideo = false;
  username = ''; // filled from auth

  playedPercent = 0;
  bufferedPercent = 0;

  similarVideos: VideoData[] = [];
  similarVideosLoading = false;
  similarVideosError = false;

  // Playlist properties
  playlistModalVisible = false;
  playlists: { title: string; slug: string; checked: boolean }[] = [];
  originalPlaylists: { title: string; slug: string; checked: boolean }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private savedapi: SavedApiService,
    public videoapi: VideoApiService,
    private playlistapi: PlaylistAPIService, // Inject PlaylistAPIService
    private watchedapi: WatchedApiService, // Inject WatchedApiService
    private cd: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {
    this.videoId = this.route.snapshot.paramMap.get('videoId');

    if (this.videoId) {
      this.fetchVideo(this.videoId);
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  vidstackReady = false;

  ngAfterViewInit(): void {
    window.scrollTo(0, 0);
  }

  onVideoLoaded() {
    const videoElement = this.videoRef?.nativeElement;
    if (videoElement) {
      const storedMute = localStorage.getItem('isMuted');
      videoElement.muted = storedMute === 'true';
      videoElement.removeEventListener('volumechange', this.onVolumeChange);
      videoElement.addEventListener('volumechange', this.onVolumeChange);
    }
  }

  onVolumeChange = () => {
    const videoElement = this.videoRef?.nativeElement;
    if (!videoElement) return;
    localStorage.setItem('isMuted', String(videoElement.muted));
  };

  fetchVideo(videoId: string) {
    this.loading = true;
    this.error = false;
    this.videoapi.getVideoById(videoId).subscribe({
      next: (response) => {
        this.video = response.data;
        (window as any).video = this.video;
        this.loading = false;
        this.loadSimilarVideos(videoId);
        this.username = localStorage.getItem('username') ?? '';
        this.checkIfVideoSaved();

        // --- Mark video as watched when successfully loaded ---
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
        // --- End of watched video update ---
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  loadSimilarVideos(videoId: string) {
    this.similarVideosLoading = true;
    this.similarVideosError = false;

    this.videoapi.getSimilarVideos(videoId).subscribe({
      next: (res) => {
        this.similarVideos = res.data.similarVideos || [];
        this.similarVideosLoading = false;
      },
      error: () => {
        this.similarVideosLoading = false;
        this.similarVideosError = true;
      },
    });
  }

  navigateToVideo(videoId: string) {
    if (videoId === this.videoId) return;

    this.loading = true;
    this.error = false;
    this.similarVideos = [];
    this.similarVideosLoading = true;
    this.similarVideosError = false;

    this.router.navigate(['/watch', videoId], { replaceUrl: true }).then(() => {
      this.videoId = videoId;
      this.fetchVideo(videoId); // This will re-trigger the watched update
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

  formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    return parts.join(' ');
  }

  addTag() {
    const tag = this.newTag.trim();
    if (!tag) return;

    if (this.video.tags.includes(tag)) {
      this.newTag = '';
      return;
    }

    if (!this.videoId) return;

    this.updatingTags = true;
    this.tagUpdateError = false;

    this.videoapi.addVideoTag(this.videoId, tag).subscribe({
      next: (res) => {
        this.video.tags = res.data.tags;
        this.newTag = '';
        this.updatingTags = false;
      },
      error: () => {
        this.updatingTags = false;
        this.tagUpdateError = true;
      },
    });
  }

  onTagRemoved(removedTag: string) {
    const index = this.video.tags.indexOf(removedTag);
    if (index !== -1) {
      this.video.tags.splice(index, 1);
    }
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

    this.LoadingSavedVideo = true;

    const done = () => (this.LoadingSavedVideo = false);

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

  // New methods for playlist functionality
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
