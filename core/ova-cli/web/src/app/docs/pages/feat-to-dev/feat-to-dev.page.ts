import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'doc-feat-to-dev',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feat-to-dev.page.html',
})
export class DocFeatsToDevPage {
  Version01 = `
  - Initial release of the application.
  - Added changelog page.
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
