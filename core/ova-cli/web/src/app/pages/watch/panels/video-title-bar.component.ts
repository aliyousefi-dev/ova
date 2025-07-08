import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-video-title-bar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './video-title-bar.component.html',
})
export class VideoTitleBarComponent {
  @Input() videoTitle?: string;
}
