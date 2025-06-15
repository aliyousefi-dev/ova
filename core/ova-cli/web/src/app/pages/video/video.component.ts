import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { PlaylistData } from '../../data-types/playlist-data';
import { VideoData } from '../../data-types/video-data';
import { AuthApiService } from '../../services/auth-api.service';
import { VideoApiService } from '../../services/video-api.service';

import { FolderTreeComponent } from '../../components/folder-tree/folder-tree.component';
import { TopNavBarComponent } from '../../components/top-nav-bar/top-nav-bar.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar';
import { VideoGridComponent } from '../../components/video-grid/video-grid.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavigationStart } from '@angular/router';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [
    FolderTreeComponent,
    TopNavBarComponent,
    SearchBarComponent,
    VideoGridComponent,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './video.component.html',
})
export class VideoComponent implements OnInit {
  allVideos: VideoData[] = [];
  videos: VideoData[] = [];
  folders: string[] = [];
  loading = true;

  searchTerm = '';
  currentFolder = '';
  sortOption = 'titleAsc';

  currentPage = 1;
  limit = 20;
  totalPages = 1;

  isCollectionsDropdownOpen = false;
  playlists: PlaylistData[] = [];
  username: string | null = null;

  constructor(
    private authapi: AuthApiService,
    private videoapi: VideoApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadUsername();
    this.fetchFolders();

    // Restore scroll position on init
    const scrollY = sessionStorage.getItem('videoListScroll');
    if (scrollY) {
      setTimeout(() => window.scrollTo(0, +scrollY!), 0);
    }

    // Save scroll position on navigation away
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        sessionStorage.setItem('videoListScroll', window.scrollY.toString());
      }
    });

    this.route.paramMap.subscribe((params) => {
      const folderPath = params.get('folderPath') || '';
      this.currentFolder = folderPath;
      this.currentPage = 1;
      this.fetchVideos();
    });
  }

  loadUsername() {
    const storedUsername = localStorage.getItem('username');
    this.username = storedUsername ? storedUsername : null;
  }

  fetchFolders() {
    this.videoapi.getFolderLists().subscribe({
      next: (res) => {
        this.folders = res.data || [];
      },
      error: () => {
        this.folders = [];
      },
    });
  }

  fetchVideos() {
    this.loading = true;

    this.videoapi.getVideosByFolder(this.currentFolder).subscribe({
      next: (res) => {
        this.allVideos = res.data.videos || [];
        this.totalPages = Math.ceil(this.allVideos.length / this.limit);
        this.currentPage = 1;
        this.paginateVideos();
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

  paginateVideos() {
    let filtered = this.allVideos.filter((v) =>
      v.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    filtered = this.sortVideos(filtered);

    this.totalPages = Math.ceil(filtered.length / this.limit);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }

    const start = (this.currentPage - 1) * this.limit;
    const end = start + this.limit;
    this.videos = filtered.slice(start, end);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginateVideos();
    }
  }

  onFolderSelected(folder: string) {
    if (folder) {
      this.router.navigate(['/library', folder]);
    } else {
      this.router.navigate(['/library']);
    }
  }

  setSearchTerm(term: string) {
    this.searchTerm = term;
    this.currentPage = 1;
    this.paginateVideos();
  }

  setSortOption(option: string) {
    this.sortOption = option;
    this.currentPage = 1;
    this.paginateVideos();
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

  // Added getter for filtered video count for display
  get filteredVideosCount(): number {
    const term = this.searchTerm.toLowerCase();
    return this.allVideos.filter((v) => v.title.toLowerCase().includes(term))
      .length;
  }
}
