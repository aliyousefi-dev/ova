import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  PlusSquare,
  Bookmark,
  BookmarkPlus,
} from 'lucide-angular';

@Component({
  selector: 'app-video-action-bar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './video-action-bar.component.html',
  styles: [],
})
export class VideoActionBarComponent {
  @Input() videoTitle?: string;
  @Input() isSaved = false;
  @Input() loadingSavedVideo = false;

  @Output() toggleSaved = new EventEmitter<void>();
  @Output() addToPlaylist = new EventEmitter<MouseEvent>();

  // Expose icons for template binding
  readonly PlusSquare = PlusSquare;
  readonly Bookmark = Bookmark;
  readonly BookmarkPlus = BookmarkPlus;
}
