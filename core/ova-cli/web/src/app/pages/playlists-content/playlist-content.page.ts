import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GalleryViewComponent } from '../../components/containers/gallery-view/gallery-view.component';
import { PlaylistAPIService } from '../../services/api/playlist-api.service';
import { VideoApiService } from '../../services/api/video-api.service';

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [CommonModule, GalleryViewComponent],
  templateUrl: './playlist-content.page.html',
})
export class PlaylistContentPage implements OnInit {
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
    this.playlistapi
      .getUserPlaylistBySlug(this.username!, title.toLowerCase())
      .subscribe({
        next: (response) => {
          const playlist = response.data;

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
