import { Component, Input, Output, EventEmitter } from '@angular/core';
import { VideoApiService } from '../../services/video-api.service';

@Component({
  selector: 'app-tag-chip',
  templateUrl: './tag-chip.component.html',
  standalone: true,
})
export class TagChipComponent {
  @Input() tag!: string;
  @Input() videoId!: string; // receive videoId as input
  @Output() removed = new EventEmitter<string>(); // emit removed tag string

  removing = false;
  removeError = false;

  constructor(private videoApi: VideoApiService) {}

  removeTag() {
    if (!this.videoId) return;

    this.removing = true;
    this.removeError = false;

    this.videoApi.removeVideoTag(this.videoId, this.tag).subscribe({
      next: (res) => {
        this.removing = false;
        this.removed.emit(this.tag); // notify parent that removal succeeded
      },
      error: () => {
        this.removing = false;
        this.removeError = true;
      },
    });
  }
}
