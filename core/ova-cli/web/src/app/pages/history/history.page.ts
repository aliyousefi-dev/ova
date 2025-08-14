import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { WatchedApiService } from '../../services/api/watched-api.service';
import { VideoData } from '../../data-types/video-data';
import { VideoGalleryComponent } from '../../components/containers/video-gallery/video-gallery.component';
import { SearchBarComponent } from '../../components/utility/search-bar/search-bar.component';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    VideoGalleryComponent,
    SearchBarComponent,
  ],
  templateUrl: './history.page.html',
})
export class HistoryPage implements OnInit {
  allVideos: VideoData[] = [];
  videos: VideoData[] = [];
  loading = true;

  currentPage = 1;
  limit = 20;
  totalPages = 1;

  searchTerm = '';
  sortOption = 'titleAsc';

  constructor(private watchedApi: WatchedApiService) {}

  ngOnInit() {
    const username = localStorage.getItem('username');
    if (!username) return;

    this.loading = true;
    this.watchedApi.getUserWatched(username).subscribe({
      next: (videos) => {
        this.allVideos = videos;
        this.filterAndPaginate();
        this.loading = false;
      },
      error: () => {
        this.allVideos = [];
        this.videos = [];
        this.totalPages = 1;
        this.loading = false;
      },
    });
  }

  filterAndPaginate() {
    let filtered = this.allVideos.filter((v) =>
      v.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    filtered = this.sortVideos(filtered);

    this.totalPages = Math.ceil(filtered.length / this.limit);
    if (this.currentPage > this.totalPages) this.currentPage = 1;

    const start = (this.currentPage - 1) * this.limit;
    const end = start + this.limit;
    this.videos = filtered.slice(start, end);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.filterAndPaginate();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setSearchTerm(term: string) {
    this.searchTerm = term;
    this.currentPage = 1;
    this.filterAndPaginate();
  }

  setSortOption(option: string) {
    this.sortOption = option;
    this.currentPage = 1;
    this.filterAndPaginate();
  }

  sortVideos(videos: VideoData[]): VideoData[] {
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

  get filteredVideosCount(): number {
    return this.allVideos.filter((v) =>
      v.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    ).length;
  }
}
