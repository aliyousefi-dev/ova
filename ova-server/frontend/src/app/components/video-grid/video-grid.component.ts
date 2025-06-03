import { Component, Input, OnInit } from '@angular/core';
import { VideoCardComponent } from '../../components/video-card/video-card.component';
import { CommonModule } from '@angular/common';
import { APIService } from '../../services/api.service';

@Component({
  selector: 'app-video-grid',
  standalone: true,
  imports: [CommonModule, VideoCardComponent],
  templateUrl: './video-grid.component.html',
})
export class VideoGridComponent implements OnInit {
  @Input() videos: any[] = [];
  @Input() getThumbnailUrl!: (videoId: string) => string;
  @Input() getPreviewUrl!: (videoId: string) => string;

  favoriteIds = new Set<string>();
  username: string | null = null;

  constructor(private apiService: APIService) {}

  ngOnInit() {
    this.apiService.checkAuth().subscribe((auth) => {
      if (auth.authenticated && auth.username) {
        this.username = auth.username;
        this.apiService.getUserFavorites(auth.username).subscribe((favData) => {
          this.favoriteIds = new Set(favData.favorites);
        });
      }
    });
  }

  isFavorite(videoId: string): boolean {
    return this.favoriteIds.has(videoId);
  }
}
