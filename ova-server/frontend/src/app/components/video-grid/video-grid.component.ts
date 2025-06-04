import { Component, Input, OnInit } from '@angular/core';
import { VideoCardComponent } from '../../components/video-card/video-card.component';
import { CommonModule } from '@angular/common';
import { VideoData } from '../../data-types/video-data';
import { FavoriteApiService } from '../../services/favorite-api.service';

@Component({
  selector: 'app-video-grid',
  standalone: true,
  imports: [CommonModule, VideoCardComponent],
  templateUrl: './video-grid.component.html',
})
export class VideoGridComponent implements OnInit {
  @Input() videos: VideoData[] = [];
  @Input() getThumbnailUrl!: (videoId: string) => string;
  @Input() getPreviewUrl!: (videoId: string) => string;

  favoriteIds = new Set<string>();
  username: string | null = null;

  constructor(private favorite: FavoriteApiService) {}

  ngOnInit() {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.username = storedUsername;
      this.favorite.getUserFavorites(storedUsername).subscribe((favData) => {
        this.favoriteIds = new Set(favData.favorites);
      });
    }
  }

  isFavorite(videoId: string): boolean {
    return this.favoriteIds.has(videoId);
  }
}
