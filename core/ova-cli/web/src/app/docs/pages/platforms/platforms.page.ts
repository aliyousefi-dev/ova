import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodePreviewComponent } from '../../code-preview/code-preview';

@Component({
  selector: 'doc-platforms',
  standalone: true,
  imports: [CommonModule, FormsModule, CodePreviewComponent],
  templateUrl: './platforms.page.html',
})
export class DocPlatformsPage {
  Version01 = `
  - Initial release of the application.
  - Added platforms page.
  - Improved performance of video loading.
  - Fixed bug with video playback controls.
  - Added support for new video formats.
  `;

  Version02 = `
  - Initial release of the application.
  - Added changelog page.
  - Improved performance of video loading.
  - Fixed bug with video playback controls.
  - Added support for new video formats.
  `;
}
