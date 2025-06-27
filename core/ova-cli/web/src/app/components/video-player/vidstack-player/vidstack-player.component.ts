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
  styleUrl: './vidstack-player.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
})
export class VidstackPlayerComponent implements OnInit, AfterViewInit {
  @Input() videoUrl!: string;
  @Input() posterUrl?: string;
  @Input() vttUrl?: string;
  @Input() vttMarkersUrl?: string;

  isMuted = false;
  volume = 1;

  @ViewChild('mediaPlayer', { static: false }) mediaPlayerRef!: ElementRef;

  ngOnInit() {
    this.isMuted = localStorage.getItem('playerMuted') === 'true';
    const vol = parseFloat(localStorage.getItem('playerVolume') || '');
    if (!isNaN(vol)) this.volume = vol;
  }

  ngAfterViewInit() {
    const mediaPlayer: any = this.mediaPlayerRef.nativeElement;

    mediaPlayer.addEventListener('loadedmetadata', () => {
      mediaPlayer.muted = this.isMuted;
      mediaPlayer.volume = this.volume;
    });

    mediaPlayer.addEventListener('volume-change', () => {
      localStorage.setItem('playerMuted', String(mediaPlayer.muted));
      localStorage.setItem('playerVolume', String(mediaPlayer.volume));
    });
  }

  getCurrentTime(): number {
    const mediaPlayer: any = this.mediaPlayerRef?.nativeElement;
    return mediaPlayer?.currentTime || 0;
  }
}
