import {
  Component,
  Input,
  CUSTOM_ELEMENTS_SCHEMA,
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
export class VidstackPlayerComponent implements OnInit {
  @Input() videoUrl!: string;
  @Input() posterUrl?: string;

  ngOnInit(): void {
    console.log('VidstackPlayerComponent initialized');
    console.log('videoUrl:', this.videoUrl);
    console.log('posterUrl:', this.posterUrl);
  }
}
