import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { TagLinkComponent } from '../../../components/video/tag-link/tag-link.component';

@Component({
  selector: 'app-video-tags-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, TagLinkComponent],
  templateUrl: './video-tags-panel.component.html',
})
export class VideoTagsPanelComponent {
  @Input() tags: string[] = [];

  constructor(private router: Router) {}

  onTagClick(tag: string) {
    this.router.navigate(['/discover'], { queryParams: { q: tag } });
  }
}
