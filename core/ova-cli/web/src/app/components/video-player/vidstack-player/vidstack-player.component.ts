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
  styleUrls: ['./vidstack-player.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
})
export class VidstackPlayerComponent {
  @Input() videoUrl!: string;
  @Input() posterUrl?: string;
  @Input() vttUrl?: string;
  @Input() vttMarkersUrl?: string;

  @ViewChild('mediaPlayer', { static: false }) mediaPlayerRef!: ElementRef;

  // Get current playback time of the media player
  getCurrentTime(): number {
    const mediaPlayer: any = this.mediaPlayerRef?.nativeElement;
    return mediaPlayer?.currentTime || 0;
  }
}
