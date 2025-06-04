import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { SearchBarComponent } from '../../components/search-bar/search-bar';
import { FolderTreeComponent } from '../../components/folder-tree/folder-tree.component';
import { TopNavBarComponent } from '../../components/top-nav-bar/top-nav-bar.component';
import { VideoGridComponent } from '../../components/video-grid/video-grid.component';

import { PlaylistData } from '../../data-types/playlist-data';
import { VideoData } from '../../data-types/video-data';
import { AuthApiService } from '../../services/auth-api.service';
import { VideoApiService } from '../../services/video-api.service';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchBarComponent,
    VideoGridComponent,
    FolderTreeComponent,
    TopNavBarComponent,
  ],
  templateUrl: './video.component.html',
})
export class VideoComponent implements OnInit {
  protected videos: VideoData[] = [];
  protected folders: string[] = [];
  protected loading = true;
  protected searchTerm = '';
  protected currentFolder = '';
  protected sortOption: string = 'titleAsc';

  // New properties for collections modal
  isCollectionsDropdownOpen = false;
  playlists: PlaylistData[] = [];
  username: string | null = null;

  constructor(
    private authapi: AuthApiService,
    private videoapi: VideoApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchFolders();
    this.fetchVideos();
    this.loadUsername();
  }

  loadUsername() {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.username = storedUsername;
    } else {
      this.username = null;
    }
  }

  getThumbnailUrl(videoId: string): string {
    return this.videoapi.getThumbnailUrl(videoId);
  }

  getPreviewUrl(videoId: string): string {
    return this.videoapi.getPreviewUrl(videoId);
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
        this.videos = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.videos = [];
        this.loading = false;
      },
    });
  }

  onFolderSelected(folder: string) {
    this.currentFolder = folder;
    this.fetchVideos();
  }

  get filteredVideos() {
    const filtered = this.videos.filter((v) =>
      v.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    return this.sortVideos(filtered);
  }

  sortVideos(videos: VideoData[]) {
    switch (this.sortOption) {
      case 'titleAsc':
        return videos.sort((a, b) => a.title.localeCompare(b.title));
      case 'titleDesc':
        return videos.sort((a, b) => b.title.localeCompare(a.title));
      case 'durationAsc':
        return videos.sort((a, b) => a.durationSeconds - b.durationSeconds);
      case 'durationDesc':
        return videos.sort((a, b) => b.durationSeconds - a.durationSeconds);
      default:
        return videos;
    }
  }
}
