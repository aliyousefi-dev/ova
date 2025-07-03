import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
  NgZone,
  ViewEncapsulation,
} from '@angular/core';
import videojs from 'video.js';

import {
  lockOrientationUniversal,
  setupOrientationHandler,
  defaults,
} from './orientation-lock';
import { registerDoubleTapPlugin } from './videojs-double-tap';

const iosVersionNumber = parseInt(videojs.browser.IOS_VERSION ?? '0', 10);
const isIOS = videojs.browser.IS_IOS && iosVersionNumber > 9;
const isAndroid = videojs.browser.IS_ANDROID;

@Component({
  selector: 'app-videojs-player',
  standalone: true,
  templateUrl: './videojs-player.component.html',
  styles: [
    `
      video {
        width: 100%;
        height: auto;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class VideojsPlayerComponent implements OnInit, OnDestroy {
  @Input() videoUrl!: string;
  @Input() posterUrl?: string;
  @Input() markers: number[] = [];

  @ViewChild('target', { static: true }) target!: ElementRef<HTMLVideoElement>;

  player: any;
  videoId = 'videojs-player-' + Math.random().toString(36).substring(2, 9);
  private cleanupOrientationListener?: () => void;

  private onOrientationChangeHandler = () => {
    if (!this.player) return;

    const angle =
      typeof window.orientation === 'number'
        ? window.orientation
        : (window.screen as any)?.orientation?.angle ?? 0;

    if (angle === 90 || angle === -90 || angle === 270) {
      if (
        defaults.fullscreen.enterOnRotate &&
        !this.player.paused() &&
        !this.player.isFullscreen()
      ) {
        this.player.requestFullscreen();
        lockOrientationUniversal('landscape');
      }
    } else if (angle === 0 || angle === 180) {
      if (defaults.fullscreen.exitOnRotate && this.player.isFullscreen()) {
        this.player.exitFullscreen();
      }
    }
  };

  private isPiPActive(): boolean {
    return !!document.pictureInPictureElement;
  }

  constructor(private zone: NgZone) {}

  ngOnInit(): void {
    registerDoubleTapPlugin();

    const options = {
      controls: true,
      autoplay: false,
      preload: 'auto',
      poster: this.posterUrl,
      sources: [
        {
          src: this.videoUrl,
          type: 'video/mp4',
        },
      ],
      fluid: true,
      aspectRatio: '16:9',
    };

    this.zone.runOutsideAngular(() => {
      this.player = videojs(this.target.nativeElement, options, () => {
        // Markers
        if (this.markers.length) {
          this.player.on('timeupdate', () => {
            const currentTime = this.player.currentTime();
            this.markers.forEach((markerTime) => {
              if (Math.abs(currentTime - markerTime) < 0.5) {
                console.log(`Marker hit at ${markerTime}s`);
              }
            });
          });
        }

        if (isIOS && defaults.fullscreen.iOS) {
          this.player.addClass('vjs-landscape-fullscreen');
          const techEl = this.player.tech_ && this.player.tech_.el_;
          if (techEl) {
            techEl.setAttribute('playsinline', 'playsinline');
            this.player.tech_.supportsFullScreen = () => false;
          }
        }

        this.player.doubleTapFF();

        this.cleanupOrientationListener = setupOrientationHandler(
          this.player,
          this.onOrientationChangeHandler,
          isIOS,
          isAndroid
        );

        // Resume play if PiP active (optional)
        if (this.isPiPActive()) {
          this.player.play();
        }
      });
    });
  }

  ngOnDestroy(): void {
    if (this.player) {
      if (!this.isPiPActive()) {
        this.player.dispose();
      } else {
        console.log('Skipping dispose: PiP active');
      }
    }
    if (this.cleanupOrientationListener) {
      this.cleanupOrientationListener();
    }
  }
}
