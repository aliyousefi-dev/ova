import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GalleryFetcherComponent } from '../../components/manager/gallery-fetcher/gallery-fetcher.component';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [CommonModule, FormsModule, GalleryFetcherComponent],
  templateUrl: './history.page.html',
})
export class HistoryPage {}
