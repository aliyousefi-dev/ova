import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { TopNavBarComponent } from '../../components/top-nav-bar/top-nav-bar.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar';
import { VideoGridComponent } from '../../components/video-grid/video-grid.component';
import { VideoApiService } from '../../services/video-api.service';
import { FavoriteApiService } from '../../services/favorite-api.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TopNavBarComponent,
    SearchBarComponent,
    VideoGridComponent,
  ],
  templateUrl: './favorites.component.html',
})
export class FavoritesComponent implements OnInit {
  protected videos: any[] = [];
  protected loading = true;
  protected searchTerm = '';
  protected sortOption: string = 'titleAsc';
  protected username: string | null = null;

  constructor(
    private videoapi: VideoApiService,
    private favoriteapi: FavoriteApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUsername();
  }

  loadUsername() {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.username = storedUsername;
      this.fetchFavorites(storedUsername);
    } else {
      this.router.navigate(['/login']);
    }
  }

  fetchFavorites(username: string) {
    this.loading = true;
    this.favoriteapi.getUserFavorites(username).subscribe({
      next: (res) => {
        const ids = res.favorites || []; // This should be string[]
        if (ids.length === 0) {
          this.videos = [];
          this.loading = false;
          return;
        }

        this.videoapi.getVideosByIds(ids).subscribe({
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
        this.videos = [];
        this.loading = false;
      },
    });
  }

  get filteredVideos() {
    const filtered = this.videos.filter((v) =>
      v.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    return this.sortVideos(filtered);
  }

  sortVideos(videos: any[]) {
    switch (this.sortOption) {
      case 'titleAsc':
        return [...videos].sort((a, b) => a.title.localeCompare(b.title));
      case 'titleDesc':
        return [...videos].sort((a, b) => b.title.localeCompare(a.title));
      case 'durationAsc':
        return [...videos].sort(
          (a, b) => a.durationSeconds - b.durationSeconds
        );
      case 'durationDesc':
        return [...videos].sort(
          (a, b) => b.durationSeconds - a.durationSeconds
        );
      case 'newest':
        return [...videos].sort(
          (a, b) =>
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
      case 'oldest':
        return [...videos].sort(
          (a, b) =>
            new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
        );
      default:
        return videos;
    }
  }
}
