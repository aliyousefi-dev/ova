import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoData } from '../../data-types/video-data';
import { IonIcon, IonButton } from '@ionic/angular/standalone';
// @ts-ignore
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { StatusBar } from '@capacitor/status-bar'; // <-- Add this import
import { VideoApiService } from '../../services/video-api.service';

@Component({
  selector: 'app-custom-video-player',
  templateUrl: './custom-video-player.component.html',
  styleUrls: ['./custom-video-player.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, IonButton],
})
export class CustomVideoPlayerComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() streamUrl: string = '';
  @Input() videoData: VideoData | null = null;
  @ViewChild('videoPlayer') videoPlayerRef!: ElementRef<HTMLVideoElement>;
  showControls: boolean = true;
  isPlaying: boolean = false;
  progress: number = 0;
  private updateInterval: any;
  thumbnailUrl: string = '';

  constructor(private videoApi: VideoApiService) {}

  ngOnInit() {}

  ngAfterViewInit() {
    const videoEl = this.videoPlayerRef?.nativeElement;
    if (videoEl && this.videoData) {
      this.thumbnailUrl = this.videoApi.getThumbnailUrl(this.videoData.videoId);

      videoEl.addEventListener('fullscreenchange', async () => {
        if (document.fullscreenElement === videoEl) {
          videoEl.style.width = '100vw';
          videoEl.style.height = '100vh';
          videoEl.style.position = 'fixed';
          videoEl.style.top = '0';
          videoEl.style.left = '0';
          videoEl.style.zIndex = '9999';
          videoEl.style.border = 'none';
          videoEl.style.margin = '0';
          videoEl.style.padding = '0';
          videoEl.style.objectFit = 'contain';
          videoEl.style.backgroundColor = '#000';

          try {
            await ScreenOrientation.lock({ orientation: 'landscape' });
            await StatusBar.hide();
          } catch (e) {
            console.warn('Could not handle fullscreen enter:', e);
          }
        } else {
          videoEl.style.width = '100%';
          videoEl.style.height = 'auto';
          videoEl.style.position = 'static';
          videoEl.style.zIndex = 'auto';
          videoEl.style.borderRadius = '12px';

          try {
            await ScreenOrientation.unlock();
            await StatusBar.show();
          } catch (e) {
            console.warn('Could not handle fullscreen exit:', e);
          }
        }
      });

      videoEl.addEventListener('timeupdate', () => {
        this.progress = (videoEl.currentTime / videoEl.duration) * 100;
      });
    }
  }

  ngOnDestroy() {
    clearInterval(this.updateInterval);
  }

  toggleControls() {
    this.showControls = !this.showControls;
  }

  togglePlay() {
    const videoEl = this.videoPlayerRef?.nativeElement;
    if (videoEl) {
      if (videoEl.paused) {
        videoEl.play();
        this.isPlaying = true;
      } else {
        videoEl.pause();
        this.isPlaying = false;
      }
    }
  }
}
