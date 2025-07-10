import {
  Component,
  OnInit,
  AfterViewInit,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-searchbar-expandable',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './searchbar-expandable.html',
  styles: [
    `
      /* Add this CSS class to disable transitions */
      .disable-transitions {
        transition: none !important;
      }
      /* Ensure the search input container matches the navbar height */
      .search-input-container {
        min-height: 4rem; /* Adjust this value if your navbar height is different (e.g., h-20 would be 5rem) */
        display: flex; /* Ensure flex behavior for alignment inside this container */
        align-items: center; /* Vertically center content */
      }
    `,
  ],
})
export class SearchbarExpandable implements OnInit, AfterViewInit {
  @Input() public isSearchVisible = false; // Input to control visibility from parent
  @Output() searchClosed = new EventEmitter<void>(); // Output to emit when search is closed

  searchResults: string[] = []; // Array to hold fake suggestions

  initialLoad = true; // New property to control initial transition

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound properties of a directive.
   * This component no longer directly interacts with localStorage for its visibility.
   * The parent component will handle that.
   */
  ngOnInit() {
    // Keep this if you want the *component itself* to remember its state,
    // but be aware that the @Input() from the parent will override it on initial render.
    // For this specific setup, the parent `TopNavbar` will manage localStorage.
  }

  /**
   * Lifecycle hook that is called after Angular has fully initialized a component's view.
   * Use this to re-enable transitions after the initial render.
   */
  ngAfterViewInit() {
    // Use a setTimeout to ensure the browser has rendered the initial state
    // before re-enabling transitions. A 0ms timeout puts it at the end of the current event queue.
    setTimeout(() => {
      this.initialLoad = false;
    }, 0);
  }

  /**
   * Explicitly closes the search bar and emits an event.
   */
  closeSearch() {
    this.isSearchVisible = false;
    this.searchResults = [];
    this.searchClosed.emit(); // Emit the event when closed
  }

  /**
   * Handles input events on the search field to generate fake suggestions.
   * @param event The input event.
   */
  onSearchInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value.toLowerCase();

    if (query.length > 0) {
      const allFakeSuggestions = [
        'Adventure Tours',
        'Beach Vacations',
        'Mountain Hiking',
        'City Breaks',
        'Cultural Experiences',
        'Wildlife Safaris',
        'Foodie Destinations',
        'Historical Sites',
        'Spa Retreats',
        'Cruises',
      ];

      this.searchResults = allFakeSuggestions.filter((s) =>
        s.toLowerCase().includes(query)
      );

      if (this.searchResults.length === 0) {
        this.searchResults = [
          'No exact match, try:',
          'Popular destinations',
          'New experiences',
        ];
      }
    } else {
      this.searchResults = [];
    }
  }
}
