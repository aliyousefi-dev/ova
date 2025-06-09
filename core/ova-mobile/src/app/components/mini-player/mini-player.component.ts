import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonLabel,
  IonFooter,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonThumbnail, // <-- Add this import
} from '@ionic/angular/standalone';
import { VideoPlayerService } from '../../services/video-player.service';
import { Router } from '@angular/router';
import { VideoApiService } from '../../services/video-api.service';
import { VideoData } from '../../data-types/video-data';

@Component({
  selector: 'app-mini-player',
  templateUrl: './mini-player.component.html',
  standalone: true,
  imports: [
    IonIcon,
    IonButton,
    IonButtons,
    IonToolbar,
    IonFooter,
    IonLabel,
    IonThumbnail, // <-- Add this to imports
    CommonModule,
  ],
})
export class MiniPlayerComponent implements OnInit {
  @Input() video?: VideoData | null;
  @Input() isPlaying!: boolean; // <-- Definite assignment assertion

  constructor(
    public videoPlayer: VideoPlayerService,
    private router: Router,
    // Optionally inject if you want to use directly
    private videoApi: VideoApiService
  ) {}

  ngOnInit() {}

  expand() {
    if (this.video && this.video.videoId) {
      this.router.navigate(['/watch', this.video.videoId]);
    }
  }

  togglePlayback(event: Event) {
    // Placeholder for toggle playback logic
    event.stopPropagation();
    if (!this.video) {
      return;
    }
    if (this.isPlaying) {
      this.videoPlayer.pause();
    } else {
      this.videoPlayer.play();
    }
  }
}
