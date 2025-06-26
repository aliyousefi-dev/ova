import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-video-tags-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './video-tags-panel.component.html',
})
export class VideoTagsPanelComponent {
  @Input() tags: string[] = [];

  constructor(private router: Router) {}

  onTagClick(tag: string) {
    this.router.navigate(['/discover'], { queryParams: { q: tag } });
  }
}
