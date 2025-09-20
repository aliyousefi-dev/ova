import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-title-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-title-bar.component.html',
})
export class VideoTitleBarComponent {
  @Input() videoTitle?: string;
}
