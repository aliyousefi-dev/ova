import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaylistData } from '../../data-types/playlist-data';
import { VideoData } from '../../data-types/video-data';
import { VideoApiService } from '../../services/video-api.service';

@Component({
  selector: 'app-playlist-card',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './playlist-card.component.html',
})
export class PlaylistCardComponent implements OnInit {
  @Input() playlist!: PlaylistData;
  @Output() select = new EventEmitter<void>();

  headerVideo?: VideoData;

  menuOpen = false; // Default closed

  constructor(private videoapi: VideoApiService) {}

  ngOnInit(): void {
    const firstVideoId = this.playlist.videoIds?.[0];
    if (firstVideoId) {
      this.videoapi.getVideoById(firstVideoId).subscribe({
        next: (res) => {
          if (res.status === 'success' && res.data) {
            this.headerVideo = res.data;
          }
        },
        error: (err) => {
          console.error(`❌ Failed to load video ${firstVideoId}:`, err);
        },
      });
    }
  }

  getThumbnailUrl(): string {
    return this.headerVideo?.videoId
      ? this.videoapi.getThumbnailUrl(this.headerVideo.videoId)
      : '';
  }

  get hasHeaderVideo(): boolean {
    return !!this.headerVideo?.videoId;
  }

  onSelect() {
    this.select.emit();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  onEdit() {
    // Implement edit functionality here
    console.log('Edit clicked for', this.playlist.title);
  }

  onDelete() {
    // Implement delete functionality here
    console.log('Delete clicked for', this.playlist.title);
  }

  // Close menu when clicking outside component
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    this.menuOpen = false;
  }
}
