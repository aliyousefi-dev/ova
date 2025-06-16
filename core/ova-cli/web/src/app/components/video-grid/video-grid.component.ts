import { Component, Input, OnInit } from '@angular/core';
import { VideoCardComponent } from '../../components/video-card/video-card.component';
import { CommonModule } from '@angular/common';
import { VideoData } from '../../data-types/video-data';
import { SavedApiService } from '../../services/api/saved-api.service';
@Component({
  selector: 'app-video-grid',
  standalone: true,
  imports: [CommonModule, VideoCardComponent],
  templateUrl: './video-grid.component.html',
})
export class VideoGridComponent implements OnInit {
  @Input() videos: VideoData[] = [];

  SavedIds = new Set<string>();
  username: string | null = null;

  constructor(private savedapi: SavedApiService) {}

  ngOnInit() {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.username = storedUsername;
      this.savedapi.getUserSaved(storedUsername).subscribe((favData) => {
        this.SavedIds = new Set(favData.saved);
      });
    }
  }

  isSaved(videoId: string): boolean {
    return this.SavedIds.has(videoId);
  }
}
