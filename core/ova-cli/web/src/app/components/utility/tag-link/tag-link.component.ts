import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-tag-link',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tag-link.component.html',
})
export class TagLinkComponent {
  @Input() tag!: string;

  constructor(private router: Router) {}

  onClick() {
    this.router.navigate(['/search'], { queryParams: { q: this.tag } });
  }
}
