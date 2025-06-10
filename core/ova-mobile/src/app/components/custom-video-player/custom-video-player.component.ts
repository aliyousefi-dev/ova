import {
  Component,
  ViewChild,
  ElementRef,
  Input,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { VideoApiService } from '../../services/video-api.service';
import { VideoData } from '../../data-types/video-data';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-custom-video-player',
  templateUrl: './custom-video-player.component.html',
  styleUrls: ['./custom-video-player.component.scss'],
  standalone: true,
  imports: [],
})
export class CustomVideoPlayerComponent implements OnInit, AfterViewInit {
  @Input() video: VideoData | null = null;
  @ViewChild('videoPlayer') videoPlayerRef!: ElementRef<HTMLVideoElement>;
  streamUrl: string = '';
  thumbnailUrl: string = '';

  constructor(private videoApi: VideoApiService) {}

  ngOnInit(): void {
    console.log('CustomVideoPlayerComponent ngOnInit called'); // ADDED
    if (this.video) {
      console.log('Video data received:', this.video);
      this.streamUrl = this.videoApi.getStreamUrl(this.video.videoId);
      this.thumbnailUrl = this.videoApi.getThumbnailUrl(this.video.videoId);

      this.status();

      console.log('Generated stream URL:', this.streamUrl);
    }
  }

  ngAfterViewInit(): void {
    this.status();
  }

  async status() {
    await StatusBar.hide();
    await StatusBar.setOverlaysWebView({ overlay: true });
  }
}
