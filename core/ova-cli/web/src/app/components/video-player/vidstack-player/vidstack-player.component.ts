import {
  Component,
  Input,
  CUSTOM_ELEMENTS_SCHEMA,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import 'vidstack/player';
import 'vidstack/player/layouts/default';
import 'vidstack/player/ui';

@Component({
  selector: 'app-vidstack-player',
  standalone: true,
  templateUrl: './vidstack-player.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
})
export class VidstackPlayerComponent implements OnInit, AfterViewInit {
  @Input() videoUrl!: string;
  @Input() posterUrl?: string;
  @Input() vttUrl?: string; // new optional input

  isMuted = false;
  volume = 1;

  @ViewChild('mediaPlayer', { static: false }) mediaPlayerRef!: ElementRef;

  ngOnInit() {
    // Read saved settings early
    this.isMuted = localStorage.getItem('playerMuted') === 'true';
    const vol = parseFloat(localStorage.getItem('playerVolume') || '');
    if (!isNaN(vol)) this.volume = vol;
  }

  ngAfterViewInit() {
    const mediaPlayer: any = this.mediaPlayerRef.nativeElement;

    console.log(this.vttUrl);

    mediaPlayer.addEventListener('loadedmetadata', () => {
      mediaPlayer.muted = this.isMuted;
      mediaPlayer.volume = this.volume;
    });

    mediaPlayer.addEventListener('volume-change', () => {
      localStorage.setItem('playerMuted', String(mediaPlayer.muted));
      localStorage.setItem('playerVolume', String(mediaPlayer.volume));
    });
  }
}
