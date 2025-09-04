import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { VideoData } from '../../data-types/video-data';
import { VideoApiService } from '../../services/ova-backend/video-api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SpaceHeaderComponent } from './panels/space-header/space-header.component';
import { VideoListComponent } from './panels/video-list/video-list.component';
import { MemberListComponent } from './panels/member-list/member-list.component';
import { SpaceSettingsComponent } from './panels/space-settings/space-settings.component';
import { SpaceUploadComponent } from './panels/space-upload/space-upload.component';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [
    SpaceHeaderComponent,
    VideoListComponent,
    MemberListComponent,
    SpaceSettingsComponent,
    FormsModule,
    CommonModule,
    SpaceUploadComponent,
  ],
  templateUrl: './library.page.html',
})
export class LibraryPage implements OnInit, AfterViewInit, OnDestroy {
  // All existing properties and methods remain here
  copied = false;
  copyButtonLabel = 'Copy space ID to clipboard';
  SpaceSelected = 'root';
  allVideos: VideoData[] = [];
  videos: VideoData[] = [];
  loading = true;
  searchTerm = '';
  currentFolder = '';
  sortOption = 'titleAsc';
  currentPage = 1;
  limit = 20;
  totalPages = 1;

  private routerSubscription: Subscription | undefined;
  @ViewChild('videoGridContainer') videoGridContainer!: ElementRef;
  isMobile = false;

  constructor(
    private videoapi: VideoApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.updateIsMobile();
    this.route.queryParamMap.subscribe((params) => {
      this.currentPage = +(params.get('page') ?? 1);
      this.searchTerm = params.get('search') ?? '';
      this.sortOption = params.get('sort') ?? 'titleAsc';
      const folderParam = params.get('folder');
      this.currentFolder = folderParam !== null ? folderParam : '';
      this.fetchVideos();
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        sessionStorage.setItem('videoListScroll', window.scrollY.toString());
      }
    });
  }

  ngAfterViewInit() {
    const scrollY = sessionStorage.getItem('videoListScroll');
    if (scrollY) {
      setTimeout(() => {
        window.scrollTo({
          top: +scrollY!,
          behavior: 'smooth',
        });
        sessionStorage.removeItem('videoListScroll');
      }, 50);
    }
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  @HostListener('window:resize')
  updateIsMobile() {
    this.isMobile = window.innerWidth < 1024;
  }

  copySpaceId() {
    const spaceId = '#sdkfjs23kdsflkjdsf';
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(spaceId).then(() => {
        this.copied = true;
        this.copyButtonLabel = 'Copied!';
        setTimeout(() => {
          this.copied = false;
          this.copyButtonLabel = 'Copy space ID to clipboard';
        }, 1200);
      });
    }
  }

  fetchVideos() {
    this.loading = true;
    this.videoapi.getVideosByFolder(this.currentFolder).subscribe({
      next: (res) => {
        this.allVideos = res.data.videos || [];
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
      v.fileName.toLowerCase().includes(this.searchTerm.toLowerCase())
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
      this.updateQueryParams();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  updateQueryParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.currentPage,
        search: this.searchTerm || null,
        sort: this.sortOption || null,
        folder: this.currentFolder || null,
      },
      queryParamsHandling: 'merge',
    });
  }

  onFolderSelected(folder: string) {
    this.SpaceSelected = folder || 'root';
    this.router.navigate(['/spaces'], {
      queryParams: { folder, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  setSearchTerm(term: string) {
    this.searchTerm = term;
    this.currentPage = 1;
    this.paginateVideos();
    this.updateQueryParams();
  }

  setSortOption(option: string) {
    this.sortOption = option;
    this.currentPage = 1;
    this.paginateVideos();
    this.updateQueryParams();
  }

  sortVideos(videos: VideoData[]) {
    switch (this.sortOption) {
      case 'titleAsc':
        return [...videos].sort((a, b) => a.fileName.localeCompare(b.fileName));
      case 'titleDesc':
        return [...videos].sort((a, b) => b.fileName.localeCompare(a.fileName));
      case 'durationAsc':
        return [...videos].sort(
          (a, b) => a.codecs.durationSec - b.codecs.durationSec
        );
      case 'durationDesc':
        return [...videos].sort(
          (a, b) => b.codecs.durationSec - a.codecs.durationSec
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
    const term = this.searchTerm.toLowerCase();
    return this.allVideos.filter((v) => v.fileName.toLowerCase().includes(term))
      .length;
  }
}
