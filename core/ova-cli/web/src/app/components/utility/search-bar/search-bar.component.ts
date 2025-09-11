import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SuggestionApiService } from '../../../services/ova-backend/suggestion-api.service';
import { ApiResponse } from '../../../services/ova-backend/response-type';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  imports: [FormsModule, CommonModule],
})
export class SearchBarComponent {
  searchSuggestions: string[] = [];
  searchTerm: string = '';
  showSuggestions: boolean = false; // This will control the visibility of the suggestions dropdown and the overlay

  constructor(
    private suggestionApiService: SuggestionApiService,
    private router: Router
  ) {}

  // Method to handle search term input changes and fetch suggestions
  onInputChange(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    if (query.length > 2) {
      // Trigger suggestions when user types 3 or more characters
      this.suggestionApiService.getSearchSuggestions(query).subscribe(
        (response: ApiResponse<{ suggestions: string[] }>) => {
          this.searchSuggestions = response.data.suggestions;
          this.showSuggestions = true; // Show suggestions and overlay
        },
        (error) => {
          console.error('Error fetching suggestions:', error);
          this.searchSuggestions = [];
          this.showSuggestions = false; // Hide suggestions if there's an error
        }
      );
    } else {
      this.searchSuggestions = [];
      this.showSuggestions = false; // Hide suggestions if query is empty
    }
  }

  // Method to handle search submission
  onSearchSubmitted(): void {
    console.log('Search submitted with params:', this.searchTerm);
    this.router.navigate(['/search'], { queryParams: { q: this.searchTerm } });
    this.showSuggestions = false; // Close suggestions on search submit
  }

  // Method to handle suggestion click
  onSuggestionSubmitted(suggestion: string): void {
    this.searchTerm = suggestion; // Set the search term to the selected suggestion
    console.log('Suggestion submitted:', suggestion);
    this.onSearchSubmitted(); // Navigate to the search page with the suggestion as the query
  }

  // Method to close the suggestions dropdown when clicking on the overlay
  closeSuggestions(): void {
    this.showSuggestions = false;
  }
}
