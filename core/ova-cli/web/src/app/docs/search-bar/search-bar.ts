import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener,
} from '@angular/core';

@Component({
  selector: 'doc-search-bar',
  templateUrl: './search-bar.html',
})
export class DocSearchBarComponent implements OnInit, AfterViewInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  ngOnInit() {}

  ngAfterViewInit() {}

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    // Ctrl+K (or Cmd+K on Mac)
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.focusSearch();
    }
  }

  focusSearch() {
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }
}
