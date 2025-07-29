import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Subject,
  Subscription,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  of,
  map,
  catchError,
} from 'rxjs';

import { SearchApiService } from '../../../services/api/search-api.service';

@Component({
  selector: 'app-autocomplete-search-bar',
  templateUrl: './autocomplete-search-bar.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AutoCompleteSearchBarComponent implements OnInit, OnDestroy {
  @Input() placeholder: string = 'Search...';
  @Input() initialValue: string = '';

  @Output() valueChange = new EventEmitter<string>();
  @Output() suggestionSelected = new EventEmitter<string>();
  @Output() searchSubmitted = new EventEmitter<string>(); // New Output for confirmed search

  currentValue: string = '';
  suggestions: string[] = [];
  filteredSuggestions: string[] = [];
  showSuggestions: boolean = false;
  loading: boolean = false;
  activeSuggestionIndex: number = -1;

  private suggestionTermStream = new Subject<string>(); // Stream for suggestions (debounced)
  private suggestionSubscription!: Subscription;

  constructor(private searchApiService: SearchApiService) {}

  ngOnInit() {
    this.currentValue = this.initialValue;

    this.suggestionSubscription = this.suggestionTermStream
      .pipe(
        debounceTime(300), // Wait for 300ms after the last keystroke for suggestions
        distinctUntilChanged(), // Only emit if the value has changed
        switchMap((term) => {
          if (term.length < 2) {
            // Only fetch suggestions if term is at least 2 characters
            this.loading = false;
            this.suggestions = [];
            this.filterAndDisplaySuggestions();
            return of([]);
          }
          this.loading = true;
          this.activeSuggestionIndex = -1;

          return this.searchApiService.getSearchSuggestions(term).pipe(
            map((response) => response.data.suggestions || []),
            catchError((error) => {
              console.error('Error fetching search suggestions:', error);
              this.loading = false;
              return of([]);
            })
          );
        })
      )
      .subscribe((results) => {
        this.suggestions = results;
        this.filterAndDisplaySuggestions();
        this.loading = false;
        this.showSuggestions = true;
      });
  }

  // This is called on every input event (keyup, keydown, paste, etc.)
  onInputChange(): void {
    // Only emit for suggestions; the main search will be handled by onEnter or a button click
    this.suggestionTermStream.next(this.currentValue);
    this.filterAndDisplaySuggestions(); // For immediate client-side filtering if suggestions are already loaded
  }

  // Client-side filtering
  private filterAndDisplaySuggestions(): void {
    if (
      !this.currentValue ||
      this.currentValue.length < 2 ||
      !this.suggestions
    ) {
      this.filteredSuggestions = [];
      return;
    }
    const lowerCaseValue = this.currentValue.toLowerCase();
    this.filteredSuggestions = this.suggestions.filter((s) =>
      s.toLowerCase().includes(lowerCaseValue)
    );
    // Hide suggestions if the input exactly matches one
    if (
      this.filteredSuggestions.some((s) => s.toLowerCase() === lowerCaseValue)
    ) {
      this.showSuggestions = false;
    }
  }

  selectSuggestion(suggestion: string): void {
    this.currentValue = suggestion;
    this.suggestionSelected.emit(suggestion); // Inform parent about suggestion selection
    this.searchSubmitted.emit(suggestion); // Immediately trigger main search with selected suggestion
    this.showSuggestions = false;
    this.filteredSuggestions = [];
  }

  onArrowDown(): void {
    if (this.filteredSuggestions.length > 0) {
      this.activeSuggestionIndex =
        (this.activeSuggestionIndex + 1) % this.filteredSuggestions.length;
    }
  }

  onArrowUp(): void {
    if (this.filteredSuggestions.length > 0) {
      this.activeSuggestionIndex =
        (this.activeSuggestionIndex - 1 + this.filteredSuggestions.length) %
        this.filteredSuggestions.length;
    }
  }

  onEnter(): void {
    if (
      this.activeSuggestionIndex > -1 &&
      this.filteredSuggestions.length > 0
    ) {
      this.selectSuggestion(
        this.filteredSuggestions[this.activeSuggestionIndex]
      );
    } else {
      // If no suggestion is active, submit the current input value as a search
      this.searchSubmitted.emit(this.currentValue);
      this.showSuggestions = false;
    }
  }

  hideSuggestions(): void {
    setTimeout(() => {
      this.showSuggestions = false;
      this.activeSuggestionIndex = -1;
    }, 150);
  }

  ngOnDestroy(): void {
    if (this.suggestionSubscription) {
      this.suggestionSubscription.unsubscribe();
    }
    this.suggestionTermStream.complete();
  }
}
