import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core'; // Import ElementRef and ViewChild
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';

import { PlaylistData } from '../../data-types/playlist-data';
import { VideoData } from '../../data-types/video-data';
import { VideoApiService } from '../../services/api/video-api.service';

import { FolderTreeComponent } from '../../components/advance/folder-tree/folder-tree.component';
import { NavBarComponent } from '../../components/common/navbar/navbar.component';
import { SearchBarComponent } from '../../components/advance/search-bar/search-bar';
import { VideoGridComponent } from '../../components/video/video-grid/video-grid.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [
    FolderTreeComponent,
    NavBarComponent,
    SearchBarComponent,
    VideoGridComponent,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './library.page.html',
})
export class LibraryPage implements OnInit, AfterViewInit, OnDestroy {
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

  private routerSubscription: Subscription | undefined;

  // Reference to the main content div for scrolling
  @ViewChild('videoGridContainer') videoGridContainer!: ElementRef;

  constructor(
    private videoapi: VideoApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadUsername();

    this.route.queryParamMap.subscribe((params) => {
      this.currentPage = +(params.get('page') ?? 1);
      this.searchTerm = params.get('search') ?? '';
      this.sortOption = params.get('sort') ?? 'titleAsc';
      const folderParam = params.get('folder');
      if (folderParam !== null && folderParam !== undefined) {
        this.currentFolder = folderParam;
      }
      this.fetchVideos();
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        // Save the current scroll position when navigating away
        sessionStorage.setItem('videoListScroll', window.scrollY.toString());
      }
    });
  }

  ngAfterViewInit() {
    // Restore scroll position after the view has been initialized and content rendered
    const scrollY = sessionStorage.getItem('videoListScroll');
    if (scrollY) {
      setTimeout(() => {
        // Use window.scrollTo with 'smooth' behavior
        window.scrollTo({
          top: +scrollY!,
          behavior: 'smooth', // This makes the scroll smooth
        });
        sessionStorage.removeItem('videoListScroll'); // Clear it after use
      }, 50); // Small delay for rendering
    }
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadUsername() {
    const storedUsername = localStorage.getItem('username');
    this.username = storedUsername ? storedUsername : null;
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
      v.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    filtered = this.sortVideos(filtered);

    this.totalPages = Math.ceil(filtered.length / this.limit);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
      this.updateQueryParams();
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
      // Scroll to the top of the content smoothly when changing pages manually
      window.scrollTo({
        top: 0,
        behavior: 'smooth', // Smooth scroll to top
      });
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
    if (folder !== null && folder !== undefined) {
      this.router.navigate(['/library'], {
        queryParams: { folder, page: 1 },
        queryParamsHandling: 'merge',
      });
    } else {
      this.router.navigate(['/library'], {
        queryParams: { folder: null, page: 1 },
        queryParamsHandling: 'merge',
      });
    }
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

  get filteredVideosCount(): number {
    const term = this.searchTerm.toLowerCase();
    return this.allVideos.filter((v) => v.title.toLowerCase().includes(term))
      .length;
  }
}
