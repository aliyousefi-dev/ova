import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VideoGridComponent } from '../../components/video-grid/video-grid.component';
import { TopNavBarComponent } from '../../components/top-nav-bar/top-nav-bar.component';
import { PlaylistAPIService } from '../../services/api/playlist-api.service';
import { VideoApiService } from '../../services/video-api.service';

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [CommonModule, TopNavBarComponent, VideoGridComponent],
  templateUrl: './playlist-detail.page.html',
})
export class PlaylistDetailPage implements OnInit {
  playlistTitle = '';
  videos: any[] = [];
  loading = true;
  username: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private playlistapi: PlaylistAPIService,
    private videoapi: VideoApiService,
    private router: Router
  ) {}

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
        this.loadPlaylistVideos(title);
      } else {
        this.router.navigate(['/playlists']);
      }
    });
  }

  loadPlaylistVideos(title: string) {
    this.loading = true;
    this.playlistapi.getUserPlaylists(this.username!).subscribe({
      next: (response) => {
        const playlists = response.data.playlists;
        const playlist = playlists.find((p) => p.title === title);

        if (!playlist) {
          this.router.navigate(['/playlists']);
          return;
        }

        if (!playlist.videoIds || playlist.videoIds.length === 0) {
          this.videos = [];
          this.loading = false;
          return;
        }

        this.videoapi.getVideosByIds(playlist.videoIds).subscribe({
          next: (res) => {
            this.videos = res.data || [];
            this.loading = false;
          },
          error: () => {
            this.videos = [];
            this.loading = false;
          },
        });
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/playlists']);
      },
    });
  }
}
