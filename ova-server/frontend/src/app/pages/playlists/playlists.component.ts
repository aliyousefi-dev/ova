import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { TopNavBarComponent } from '../../components/top-nav-bar/top-nav-bar.component';
import {
  PlaylistCardComponent,
  PlaylistInput,
} from '../../components/playlist-card/playlist-card.component';

import { PlaylistAPIService } from '../../services/playlist-api.service';
import { PlaylistData } from '../../data-types/playlist-data';
import { VideoData } from '../../data-types/video-data';
import { VideoApiService } from '../../services/video-api.service';

@Component({
  selector: 'app-playlists',
  standalone: true,
  imports: [CommonModule, TopNavBarComponent, PlaylistCardComponent],
  templateUrl: './playlists.component.html',
})
export class PlaylistsComponent implements OnInit {
  playlists: PlaylistInput[] = [];
  loading = true;
  username: string | null = null;

  // Map videoId -> VideoData for quick lookup
  private videoMap = new Map<string, VideoData>();

  constructor(
    private playlistapi: PlaylistAPIService,
    private videoapi: VideoApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.username = localStorage.getItem('username');
    if (this.username) {
      this.loadPlaylists();
    } else {
      console.warn('No username found in localStorage');
      this.loading = false;
    }
  }

  loadPlaylists() {
    this.playlistapi.getUserPlaylists(this.username!).subscribe({
      next: (response) => {
        const playlists = response.data.playlists;

        if (!playlists.length) {
          this.playlists = [];
          this.loading = false;
          return;
        }

        // Extract first videoId from each playlist (filter out playlists with no videos)
        const firstVideoIds = playlists
          .map((p) =>
            p.videoIds && p.videoIds.length > 0 ? p.videoIds[0] : null
          )
          .filter((id): id is string => id !== null);

        // Fetch video info for those first videos in batch
        this.videoapi.getVideosByIds(firstVideoIds).subscribe({
          next: (res) => {
            if (res.status === 'success' && res.data) {
              // Fill videoMap with video data by id
              for (const video of res.data) {
                this.videoMap.set(video.videoId, video);
              }
            }
            this.mapPlaylistsToInputs(playlists);
            this.loading = false;
          },
          error: (err) => {
            console.error('Failed to load videos for thumbnails', err);
            this.mapPlaylistsToInputs(playlists); // fallback: no thumbnails
            this.loading = false;
          },
        });
      },
      error: (err) => {
        console.error('Failed to load playlists', err);
        this.loading = false;
      },
    });
  }

  private mapPlaylistsToInputs(playlists: PlaylistData[]) {
    this.playlists = playlists.map((p) => {
      // Get first videoId's thumbnail if available
      const firstVideoId =
        p.videoIds && p.videoIds.length > 0 ? p.videoIds[0] : null;
      let thumbnailUrls: string[] = [];

      if (firstVideoId && this.videoMap.has(firstVideoId)) {
        // Use thumbnail from video metadata
        thumbnailUrls = [this.videoapi.getThumbnailUrl(firstVideoId)];
      } else {
        // Use placeholder if no thumbnail available
        thumbnailUrls = [
          'http://localhost:4200/api/v1/thumbnail/5fe0c0f695bbb3e575b4ce215985c6982702b6d028e2d2db21ef72f4bcabe0df',
        ];
      }

      return {
        title: p.title,
        description: p.description || 'No description available.',
        thumbnailUrls,
      };
    });
  }

  onSelectPlaylist(playlist: PlaylistInput) {
    // Navigate to playlist detail page using playlist title as param
    this.router.navigate(['/playlists', playlist.title]);
  }
}
