import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MarkdownService } from './services/markdown.service';
import { MarkdownComponent } from 'ngx-markdown';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MarkdownComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit {
  markdownContent: string = ''; // Store the loaded markdown content

  constructor(
    private route: ActivatedRoute,
    private markdownService: MarkdownService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to route changes and load markdown content dynamically
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const file = params.get('file') || 'index.md'; // Default to 'index.md'
          return this.markdownService.getMarkdownContent(`/${file}`);
        })
      )
      .subscribe(
        (content) => {
          this.markdownContent = content; // Set loaded markdown content
        },
        (error) => {
          this.markdownContent = 'Error loading markdown content.'; // Handle errors
        }
      );
  }

  // Handle markdown link clicks and update route
  onMarkdownLinkClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.tagName === 'A' && target.getAttribute('href')) {
      const link = target.getAttribute('href');
      if (link && link.startsWith('./')) {
        event.preventDefault(); // Prevent default anchor behavior
        const file = link.slice(2); // Remove the './' prefix
        this.router.navigate([file]); // Navigate to the new route
      }
    }
  }
}
