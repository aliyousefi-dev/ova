import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VideoApiService } from '../../services/ova-backend/video-api.service';
import { VideoData } from '../../data-types/video-data';
import { VidstackPlayerComponent } from '../../components/media-player/vidstack-player/vidstack-player.component';

@Component({
  selector: 'app-version-history',
  standalone: true,
  imports: [CommonModule, FormsModule, VidstackPlayerComponent],
  templateUrl: './version-history.page.html',
})
export class VersionHistoryPage implements OnInit {
  videoId: string | null = null; // Declare the videoId variable
  videodata!: VideoData;

  constructor(
    private route: ActivatedRoute,
    private videoapi: VideoApiService
  ) {}

  ngOnInit(): void {
    // Access the videoId from the route parameter
    this.videoId = this.route.snapshot.paramMap.get('videoId');
    console.log(this.videoId);
    if (this.videoId) {
      this.fetchVideo(this.videoId);
    }
  }

  fetchVideo(videoId: string) {
    this.videoapi.getVideoById(videoId).subscribe({
      next: (response) => {
        this.videodata = response.data;
      },
    });
  }
}
