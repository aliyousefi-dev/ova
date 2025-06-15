import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vjs-player',
  templateUrl: './vjs-player.component.html',
  styleUrls: ['./vjs-player.component.css'],
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
})
export class VjsPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('target', { static: true }) target!: ElementRef;

  @Input() videoUrl!: string;
  @Input() thumbnailUrl: string = '';

  player!: Player;
  videoReady = false;

  ngOnInit() {
    const options = {
      fluid: true,
      aspectRatio: '16:9',
      autoplay: false,
      preload: 'auto',
      controls: true,
      poster: this.thumbnailUrl || '',
      sources: [
        {
          src: this.videoUrl,
          type: 'video/mp4',
        },
      ],
    };

    this.player = videojs(this.target.nativeElement, options, () => {
      console.log('Video.js player is ready');
      this.videoReady = false;
    });

    this.player.on('fullscreenchange', () => {
      const isFullscreen = this.player.isFullscreen();
      if (isFullscreen) {
        this.lockOrientation();
      } else {
        this.unlockOrientation();
      }
    });
  }

  lockOrientation() {
    const orientation = screen.orientation as any;
    if (orientation && orientation.lock) {
      orientation.lock('landscape').catch((err: any) => {
        console.warn('Orientation lock failed:', err);
      });
    }
  }

  unlockOrientation() {
    const orientation = screen.orientation as any;
    if (orientation && orientation.unlock) {
      orientation.unlock(); // unlock may not be supported in all browsers
    }
  }

  ngOnDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  }
}
