import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Tag } from 'lucide-angular';

import { TagLinkComponent } from '../../../components/utility/tag-link/tag-link.component';

@Component({
  selector: 'app-video-tags-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, TagLinkComponent, LucideAngularModule],
  templateUrl: './video-tags-panel.component.html',
})
export class VideoTagsPanelComponent {
  @Input() tags: string[] = [];

  readonly TagIcon = Tag;

  constructor(private router: Router) {}

  onTagClick(tag: string) {
    this.router.navigate(['/discover'], { queryParams: { q: tag } });
  }
}
