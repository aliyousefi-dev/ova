import { Component, Input, OnInit } from '@angular/core';
import {
  ChapterApiService,
  VttChapter,
} from '../../../services/api/chapter-api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse

@Component({
  selector: 'app-chapter-edit-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chapter-edit-panel.component.html',
})
export class ChapterEditPanelComponent implements OnInit {
  @Input() videoId!: string;

  chapters: { startTime: number; title: string }[] = [];
  loading = false;
  saving = false;

  // Global error message for API or general validation issues
  globalError: string | null = null;
  // Per-chapter error messages for input validation
  chapterErrors: { [key: number]: { startTime?: string; title?: string } } = {};

  successMessage: string | null = null;

  constructor(private chapterApi: ChapterApiService) {}

  ngOnInit() {
    this.fetchChapters();
  }

  fetchChapters() {
    if (!this.videoId) return;
    this.loading = true;
    this.globalError = null; // Clear global errors on fetch
    this.chapterErrors = {}; // Clear per-chapter errors

    this.chapterApi.getChapters(this.videoId).subscribe({
      next: (res) => {
        const raw = res.data.chapters ?? [];
        this.chapters = raw.map((c) => ({
          startTime: c.startTime,
          title: c.title,
        }));
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.globalError = err.error?.message || 'Failed to load chapters.';
        this.loading = false;
      },
    });
  }

  addChapter() {
    // Determine a reasonable default start time for a new chapter
    const newStartTime =
      this.chapters.length > 0
        ? Math.max(0, this.chapters[this.chapters.length - 1].startTime + 60)
        : 0;
    this.chapters.push({ startTime: newStartTime, title: '' });
    // Immediately trigger validation for the new empty chapter
    this.validateChapter(
      this.chapters[this.chapters.length - 1],
      this.chapters.length - 1
    );
  }

  removeChapter(index: number) {
    this.chapters.splice(index, 1);
    delete this.chapterErrors[index]; // Remove errors for deleted chapter
    this.clearGlobalErrorsIfNoChapterErrors();
  }

  // Client-side validation for a single chapter
  validateChapter(
    chapter: { startTime: number; title: string },
    index: number
  ): boolean {
    let isValid = true;
    const errors: { startTime?: string; title?: string } = {};

    // Validate startTime
    if (typeof chapter.startTime !== 'number' || isNaN(chapter.startTime)) {
      errors.startTime = 'Start time must be a number.';
      isValid = false;
    } else if (chapter.startTime < 0) {
      errors.startTime = 'Start time cannot be negative.';
      isValid = false;
    } else if (
      index > 0 &&
      chapter.startTime <= this.chapters[index - 1].startTime
    ) {
      errors.startTime = 'Start time must be after previous chapter.';
      isValid = false;
    }

    // Validate title
    if (!chapter.title || chapter.title.trim() === '') {
      errors.title = 'Title cannot be empty.';
      isValid = false;
    }

    if (Object.keys(errors).length > 0) {
      this.chapterErrors[index] = errors;
    } else {
      delete this.chapterErrors[index];
    }
    return isValid;
  }

  // Validate all chapters before saving
  validateAllChapters(): boolean {
    this.chapterErrors = {}; // Clear all previous chapter errors
    let allValid = true;
    this.chapters.forEach((chapter, index) => {
      if (!this.validateChapter(chapter, index)) {
        allValid = false;
      }
    });
    return allValid;
  }

  saveChapters() {
    if (!this.videoId) {
      this.globalError = 'Video ID is missing. Cannot save chapters.';
      return;
    }

    // Perform client-side validation for all chapters first
    if (!this.validateAllChapters()) {
      this.globalError = 'Please fix errors in individual chapter fields.';
      return;
    }

    this.saving = true;
    this.globalError = null;
    this.successMessage = null; // Clear previous messages

    // Chapters are already sanitized and sorted by the backend upon update
    // We just need to send the current valid `chapters` array.
    const chaptersToSend: VttChapter[] = this.chapters.map((c) => ({
      startTime: c.startTime,
      title: c.title.trim(), // Ensure title is trimmed before sending
    }));

    this.chapterApi.updateChapters(this.videoId, chaptersToSend).subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = 'Chapters saved successfully!';
        this.globalError = null; // Ensure no global error if save was successful
        this.chapterErrors = {}; // Clear all chapter errors on success
        // Re-fetch chapters to ensure UI reflects backend's validated and sorted data
        this.fetchChapters();
        setTimeout(() => (this.successMessage = null), 3000); // Clear success message after 3 seconds
      },
      error: (err: HttpErrorResponse) => {
        this.saving = false;
        // Try to get a specific error message from the backend response
        this.globalError =
          err.error?.message || 'Failed to save chapters. Please try again.';
        console.error('Save chapters error:', err);
      },
    });
  }

  onStartTimeInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value;

    // Convert string to number for internal model
    const seconds = this.displayToSeconds(rawValue);

    // Update the chapter model with the parsed number
    this.chapters[index].startTime = seconds;

    // Trigger validation for this specific chapter input immediately
    this.validateChapter(this.chapters[index], index);
    this.clearGlobalErrorsIfNoChapterErrors();
  }

  onTitleInput(event: Event, index: number) {
    // This is optional, but if you want immediate validation feedback on title input
    // you can call validateChapter here.
    this.validateChapter(this.chapters[index], index);
    this.clearGlobalErrorsIfNoChapterErrors();
  }

  // Formats seconds to hh:mm:ss or mm:ss for display in input fields.
  secondsToDisplay(seconds: number): string {
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0)
      return '00:00:00';
    const totalSeconds = Math.floor(seconds);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    if (h > 0) {
      return [
        h.toString().padStart(2, '0'),
        m.toString().padStart(2, '0'),
        s.toString().padStart(2, '0'),
      ].join(':');
    } else {
      return [
        m.toString().padStart(2, '0'),
        s.toString().padStart(2, '0'),
      ].join(':');
    }
  }

  // Parses hh:mm:ss.mmm or mm:ss.mmm (or just hh:mm:ss/mm:ss) string to seconds.
  displayToSeconds(displayString: string): number {
    if (!displayString) return 0;

    let totalSeconds = 0;
    const parts = displayString.trim().split(':');

    // Handle milliseconds if present (e.g., "00:01.234" or "01:00:00.500")
    let secPart = parts[parts.length - 1];
    const milliParts = secPart.split('.');
    if (milliParts.length > 1) {
      secPart = milliParts[0];
      const ms = parseInt(milliParts[1], 10);
      if (!isNaN(ms)) {
        totalSeconds += ms / 1000.0;
      }
    }

    const numericParts = parts
      .slice(0, parts.length - 1)
      .concat(secPart)
      .map(Number);

    if (numericParts.length === 3) {
      // HH:MM:SS
      totalSeconds +=
        numericParts[0] * 3600 + numericParts[1] * 60 + numericParts[2];
    } else if (numericParts.length === 2) {
      // MM:SS
      totalSeconds += numericParts[0] * 60 + numericParts[1];
    } else if (numericParts.length === 1) {
      // SS
      totalSeconds += numericParts[0];
    } else {
      return NaN; // Indicate invalid format for parsing
    }
    return totalSeconds;
  }

  // Helper to check if there are any chapter-specific errors
  hasChapterErrors(): boolean {
    return Object.keys(this.chapterErrors).length > 0;
  }

  // Clears the global error if all chapter-specific errors have been resolved
  private clearGlobalErrorsIfNoChapterErrors(): void {
    if (!this.hasChapterErrors()) {
      this.globalError = null;
    }
  }
}
