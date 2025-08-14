import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-controls',
  templateUrl: './page-controls.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class PageControlsComponent {
  @Input() TotalBuckets: number = 1;
  @Input() CurrentBucket: number = 1;
  @Output() pageChange = new EventEmitter<number>();

  loadPage(page: number): void {
    this.CurrentBucket = page;
    this.pageChange.emit(page); // Emit the selected page to the parent component
  }

  // Returns an array of pages to be displayed with ellipsis
  getPageRange(): (number | string)[] {
    const maxVisiblePages = 1; // Total visible pages (before and after the current page)
    const range: (number | string)[] = [];
    const totalPages = this.TotalBuckets;
    const currentPage = this.CurrentBucket;

    if (totalPages <= maxVisiblePages + 4) {
      // If there are fewer pages than we can show, just display them all
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Show the first page
    range.push(1);

    // Add "..." if there are pages between the first page and currentPage
    if (currentPage > maxVisiblePages + 2) {
      range.push('...');
    }

    // Show the pages around the current page (with `maxVisiblePages` before and after)
    for (
      let i = Math.max(currentPage - maxVisiblePages, 2);
      i <= Math.min(currentPage + maxVisiblePages, totalPages - 1);
      i++
    ) {
      range.push(i);
    }

    // Add "..." if there are pages between the currentPage and the last page
    if (currentPage < totalPages - maxVisiblePages - 1) {
      range.push('...');
    }

    // Show the last page
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  }
}
