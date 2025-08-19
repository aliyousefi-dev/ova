import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GalleryFetcherComponent } from '../../components/manager/gallery-fetcher/gallery-fetcher.component';

@Component({
  selector: 'app-saved-page',
  standalone: true,
  imports: [CommonModule, FormsModule, GalleryFetcherComponent],
  templateUrl: './saved.page.html',
})
export class SavedPage {}
