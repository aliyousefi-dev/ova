import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoCardComponent } from '../components/video-card/video-card.component';
import { SearchBarComponent } from '../components/search-bar/search-bar';
import { FolderTreeComponent } from '../components/folder-tree/folder-tree.component';
import { TopNavBarComponent } from '../components/top-nav-bar/top-nav-bar.component';
import { APIService } from '../services/api.service';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [
    CommonModule,
    VideoCardComponent,
    SearchBarComponent,
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

  constructor(private apiservice: APIService) {}

  ngOnInit() {
    this.fetchFolders();
    this.fetchVideos();
  }

  getThumbnailUrl(videoId: string): string {
    return this.apiservice.getThumbnailUrl(videoId);
  }

  getPreviewUrl(videoId: string): string {
    return this.apiservice.getPreviewUrl(videoId);
  }

  fetchFolders() {
    this.apiservice.getFolders().subscribe({
      next: (res) => (this.folders = res.data || []),
      error: (err) => console.error('Failed to fetch folders', err),
    });
  }

  fetchVideos() {
    this.loading = true;
    this.apiservice.getVideos(this.currentFolder).subscribe({
      next: (res) => {
        this.videos = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch videos', err);
        this.loading = false;
      },
    });
  }

  onFolderSelected(folder: string) {
    this.currentFolder = folder;
    this.fetchVideos();
  }

  handleLogout() {
    console.log('Logging out...');
  }

  get filteredVideos() {
    return this.videos.filter((v) =>
      v.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
