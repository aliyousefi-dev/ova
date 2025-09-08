import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VideoData } from '../../../../data-types/video-data';
import { GalleryViewComponent } from '../../../../components/containers/gallery-view/gallery-view.component';

@Component({
  selector: 'app-video-list',
  standalone: true,
  imports: [CommonModule, FormsModule, GalleryViewComponent],
  templateUrl: './video-list.component.html',
})
export class VideoListComponent {
  @Input() loading!: boolean;
  @Input() videos!: VideoData[];
  @Input() searchTerm!: string;
  @Input() sortOption!: string;
  @Input() currentPage!: number;
  @Input() totalPages!: number;
  @Input() filteredVideosCount!: number;

  @Output() searchTermChange = new EventEmitter<string>();
  @Output() sortOptionChange = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();
}
