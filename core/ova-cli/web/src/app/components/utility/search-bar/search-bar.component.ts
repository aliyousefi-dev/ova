import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  standalone: true,
})
export class SearchBarComponent {
  onSearchSubmitted() {
    console.log('Search submitted');
  }

  onSuggestionSubmitted(): void {
    console.log('Suggestion submitted in DiscoverPage');
  }
}
