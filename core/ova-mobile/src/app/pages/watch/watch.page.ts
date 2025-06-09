import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton, // <-- Make sure this is imported
} from '@ionic/angular/standalone';
import { VideoApiService } from '../../services/video-api.service';
import { VideoPlayerService } from '../../services/video-player.service';
import { VideoData } from '../../data-types/video-data';
// @ts-ignore
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { StatusBar } from '@capacitor/status-bar'; // <-- Add this import
import { CustomVideoPlayerComponent } from '../../components/custom-video-player/custom-video-player.component';

@Component({
  selector: 'app-watch',
  templateUrl: './watch.page.html',
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    CommonModule,
    CustomVideoPlayerComponent,
  ],
  styleUrls: ['./watch.page.scss'],
})
export class WatchPage implements OnInit, AfterViewInit, OnDestroy {
  videoId: string = '';
  streamUrl: string = '';
  videoData: VideoData | null = null;

  @ViewChild('videoPlayer') videoPlayerRef!: ElementRef<HTMLVideoElement>;
  // private videojsInstance?: any;

  constructor(
    private route: ActivatedRoute,
    private videoApi: VideoApiService,
    private videoPlayer: VideoPlayerService // <-- Inject VideoPlayerService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.videoId = params.get('videoId') || '';
      if (this.videoId) {
        this.streamUrl = this.videoApi.getStreamUrl(this.videoId);

        // Fetch video data and set as current video if not already set
        if (
          !this.videoPlayer.currentVideo ||
          this.videoPlayer.currentVideo.videoId !== this.videoId
        ) {
          this.videoApi.getVideoById(this.videoId).subscribe((response) => {
            const video = response.data; // Assuming ApiResponse<VideoData> shape
            this.videoPlayer.setVideo(video);
            this.videoData = video;
          });
        } else {
          this.videoData = this.videoPlayer.currentVideo;
        }
      }
    });
  }

  ngAfterViewInit() {
    // No need for this logic here, it's moved to the custom component
  }

  ngOnDestroy() {
    // Remove fullscreen listener and unlock orientation
    ScreenOrientation.unlock().catch(() => {});
    StatusBar.show().catch(() => {}); // Ensure status bar is visible on leave
  }
}
