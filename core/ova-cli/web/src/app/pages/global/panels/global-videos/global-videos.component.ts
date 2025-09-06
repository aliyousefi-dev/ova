import { Component } from '@angular/core';
import { GalleryFetcherComponent } from '../../../../components/manager/gallery-fetcher/gallery-fetcher.component';

@Component({
  selector: 'app-global-videos',
  templateUrl: './global-videos.component.html',
  standalone: true,
  imports: [GalleryFetcherComponent],
})
export class GlobalVideosComponent {
  constructor() {}
}
