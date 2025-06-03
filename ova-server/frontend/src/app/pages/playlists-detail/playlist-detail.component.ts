import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VideoGridComponent } from '../../components/video-grid/video-grid.component';
import { TopNavBarComponent } from '../../components/top-nav-bar/top-nav-bar.component';
import { APIService } from '../../services/api.service';

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [CommonModule, TopNavBarComponent, VideoGridComponent],
  templateUrl: './playlist-detail.component.html',
})
export class PlaylistDetailComponent implements OnInit {
  playlistTitle = '';
  videos: any[] = [];
  loading = true;
  username: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: APIService,
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
    this.api.getUserPlaylists(this.username!).subscribe({
      next: (playlists) => {
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

        this.api.getVideosByIds(playlist.videoIds).subscribe({
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

  getThumbnailUrl(videoId: string): string {
    return this.api.getThumbnailUrl(videoId);
  }

  getPreviewUrl(videoId: string): string {
    return this.api.getPreviewUrl(videoId);
  }
}
