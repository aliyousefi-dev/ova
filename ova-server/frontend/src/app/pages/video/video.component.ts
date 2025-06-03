import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { VideoCardComponent } from '../../components/video-card/video-card.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar';
import { FolderTreeComponent } from '../../components/folder-tree/folder-tree.component';
import { TopNavBarComponent } from '../../components/top-nav-bar/top-nav-bar.component';
import { APIService } from '../../services/api.service';
import { VideoGridComponent } from '../../components/video-grid/video-grid.component';

import { PlaylistData } from '../../data-types/playlist-data';

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
  protected videos: any[] = [];
  protected folders: string[] = [];
  protected loading = true;
  protected searchTerm = '';
  protected currentFolder = '';
  protected sortOption: string = 'titleAsc';

  // New properties for collections modal
  isCollectionsDropdownOpen = false;
  playlists: PlaylistData[] = [];
  username: string | null = null;

  constructor(private apiservice: APIService, private router: Router) {}

  ngOnInit() {
    this.fetchFolders();
    this.fetchVideos();
    this.loadUsername();
  }

  loadUsername() {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.username = storedUsername;
      this.loadPlaylists();
    } else {
      this.username = null;
    }
  }

  getThumbnailUrl(videoId: string): string {
    return this.apiservice.getThumbnailUrl(videoId);
  }

  getPreviewUrl(videoId: string): string {
    return this.apiservice.getPreviewUrl(videoId);
  }

  fetchFolders() {
    this.apiservice.getFolders().subscribe({
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
    this.apiservice.getVideos(this.currentFolder).subscribe({
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

  handleLogout() {
    this.apiservice.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
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

  loadPlaylists() {
    if (!this.username) return;
    this.apiservice.getUserPlaylists(this.username).subscribe({
      next: (res) => {
        this.playlists = res || [];
      },
      error: (err) => {
        console.error('Failed to load playlists', err);
        this.playlists = [];
      },
    });
  }

  selectPlaylist(playlist: PlaylistData) {
    this.isCollectionsDropdownOpen = false;
    console.log('Selected playlist:', playlist);
    // You can navigate or filter videos here
  }
}
