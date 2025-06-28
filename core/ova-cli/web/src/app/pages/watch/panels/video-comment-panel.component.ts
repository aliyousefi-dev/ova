import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Comment {
  user: string;
  time: string;
  avatar: string;
  text: string;
  position: 'start' | 'end';
  status: string;
  timeISO?: string; // optional ISO for accessibility if you want
}

@Component({
  selector: 'app-video-comment-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './video-comment-panel.component.html',
})
export class VideoCommentPanelComponent
  implements AfterViewChecked, AfterViewInit
{
  @Input() videoId!: string;

  @ViewChild('commentListContainer')
  commentListContainer!: ElementRef<HTMLDivElement>;

  newCommentText = '';

  comments: Comment[] = [
    {
      user: 'Obi-Wan',
      time: '12:45',
      avatar: 'https://img.daisyui.com/images/profile/demo/kenobee@192.webp',
      text: 'You were the Chosen One!',
      position: 'start',
      status: 'Delivered',
    },
    {
      user: 'Anakin',
      time: '12:46',
      avatar: 'https://img.daisyui.com/images/profile/demo/anakeen@192.webp',
      text: 'I hate you!',
      position: 'end',
      status: 'Seen at 12:46',
    },
    // duplicate comments trimmed for brevity
  ];

  private shouldScroll = false;

  sendComment(): void {
    const trimmedText = this.newCommentText.trim();
    if (!trimmedText) return;

    const now = new Date();

    const newComment: Comment = {
      user: 'You',
      time: this.formatTime(now),
      timeISO: now.toISOString(),
      avatar: 'https://img.daisyui.com/images/profile/demo/kenobee@192.webp',
      text: trimmedText,
      position: 'end',
      status: 'Just now',
    };

    this.comments.push(newComment);
    this.newCommentText = '';

    this.shouldScroll = true;
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.commentListContainer) {
      const el = this.commentListContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScroll = false;
    }
  }

  ngAfterViewInit(): void {
    // Optional: Scroll to bottom on initial load
    if (this.commentListContainer) {
      const el = this.commentListContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
