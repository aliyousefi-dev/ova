import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VideoData } from '../../../../data-types/video-data';

@Component({
  selector: 'app-space-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './space-upload.component.html',
})
export class SpaceUploadComponent {
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
