import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { SearchBarComponent } from '../../components/utility/search-bar/search-bar.component';
import { GalleryViewComponent } from '../../components/containers/gallery-view/gallery-view.component';
import { VideoApiService } from '../../services/api/video-api.service';
import { SavedApiService } from '../../services/api/saved-api.service';

// ... imports remain the same
@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchBarComponent,
    GalleryViewComponent,
  ],
  templateUrl: './saved.page.html',
})
export class SavedPage implements OnInit {
  protected videos: any[] = [];
  protected loading = true;
  protected searchTerm = '';
  protected sortOption: string = 'titleAsc';
  protected username: string | null = null;

  // Pagination state
  protected currentPage = 1;
  protected limit = 20;
  protected totalPages = 1;

  constructor(
    private videoapi: VideoApiService,
    private savedapi: SavedApiService,
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
    this.savedapi.getUserSaved(username).subscribe({
      next: (res) => {
        const ids = res.saved || [];
        if (ids.length === 0) {
          this.videos = [];
          this.totalPages = 1;
          this.loading = false;
          return;
        }

        this.videoapi.getVideosByIds(ids).subscribe({
          next: (res) => {
            this.videos = res.data || [];
            this.totalPages = Math.ceil(
              this.filteredVideosUnpaginated.length / this.limit
            );
            this.goToPage(1);
            this.loading = false;
          },
          error: () => {
            this.videos = [];
            this.totalPages = 1;
            this.loading = false;
          },
        });
      },
      error: () => {
        this.videos = [];
        this.totalPages = 1;
        this.loading = false;
      },
    });
  }

  get filteredVideosUnpaginated() {
    const filtered = this.videos.filter((v) =>
      v.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    return this.sortVideos(filtered);
  }

  get filteredVideos() {
    const filtered = this.filteredVideosUnpaginated;
    this.totalPages = Math.ceil(filtered.length / this.limit);

    const start = (this.currentPage - 1) * this.limit;
    const end = start + this.limit;
    return filtered.slice(start, end);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
