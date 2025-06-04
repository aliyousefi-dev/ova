import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  switchMap,
  Subscription,
  of,
} from 'rxjs';

import { TopNavBarComponent } from '../../components/top-nav-bar/top-nav-bar.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar';
import { VideoGridComponent } from '../../components/video-grid/video-grid.component';
import { VideoApiService } from '../../services/video-api.service';
import { SearchApiService } from '../../services/search-api.service';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TopNavBarComponent,
    SearchBarComponent,
    VideoGridComponent,
  ],
  templateUrl: './explore.component.html',
})
export class ExploreComponent implements OnDestroy {
  searchTerm: string = '';
  sortOption: string = 'titleAsc';
  loading: boolean = false;
  videos: any[] = [];

  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription;

  constructor(
    private searchapi: SearchApiService,
    private videoapi: VideoApiService
  ) {
    // Subscribe to searchTerm changes with debounce
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query.trim()) {
            // If search empty, clear videos & don't call API
            this.videos = [];
            this.loading = false;
            return of(null); // Emit null so subscriber fires
          }
          this.loading = true;
          return this.searchapi.searchVideos(query);
        })
      )
      .subscribe({
        next: (response) => {
          this.videos = response?.data.results || [];
          this.loading = false;
        },
        error: () => {
          this.videos = [];
          this.loading = false;
        },
      });
  }

  onSearchTermChange(term: string) {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  get filteredVideos() {
    return this.sortVideos(this.videos);
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
      default:
        return videos;
    }
  }

  getThumbnailUrl(videoId: string): string {
    return this.videoapi.getThumbnailUrl(videoId);
  }

  getPreviewUrl(videoId: string): string {
    return this.videoapi.getPreviewUrl(videoId);
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
  }
}
