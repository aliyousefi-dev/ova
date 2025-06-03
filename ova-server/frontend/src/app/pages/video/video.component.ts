import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { VideoCardComponent } from '../../components/video-card/video-card.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar';
import { FolderTreeComponent } from '../../components/folder-tree/folder-tree.component';
import { TopNavBarComponent } from '../../components/top-nav-bar/top-nav-bar.component';
import { APIService } from '../../services/api.service';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
  protected sortOption: string = 'titleAsc';

  protected isAuthenticated = true;
  protected serverAvailable = true;

  @ViewChild('loginModal') loginModalRef!: ElementRef<HTMLDialogElement>;

  constructor(private apiservice: APIService, private router: Router) {}

  ngOnInit() {
    this.apiservice.checkAuth().subscribe({
      next: (res) => {
        this.isAuthenticated = res.authenticated;
        if (this.isAuthenticated) {
          this.fetchFolders();
          this.fetchVideos();
        } else {
          setTimeout(() => this.openLoginModal(), 0);
        }
      },
      error: () => {
        this.isAuthenticated = false;
        setTimeout(() => this.openLoginModal(), 0);
      },
    });
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
        this.serverAvailable = true;
      },
      error: () => {
        this.serverAvailable = false;
      },
    });
  }

  fetchVideos() {
    this.loading = true;
    this.apiservice.getVideos(this.currentFolder).subscribe({
      next: (res) => {
        this.videos = res.data || [];
        this.loading = false;
        this.serverAvailable = true;
      },
      error: () => {
        this.loading = false;
        this.serverAvailable = false;
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

  openLoginModal() {
    const dialog = this.loginModalRef?.nativeElement;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }

  goToLogin() {
    this.loginModalRef?.nativeElement.close();
    this.router.navigate(['/login']);
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
}
