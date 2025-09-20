import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodePreviewComponent } from '../../code-preview/code-preview';

@Component({
  selector: 'doc-video-card',
  standalone: true,
  imports: [CommonModule, FormsModule, CodePreviewComponent],
  templateUrl: './video-card.page.html',
})
export class DocVideoCardPage {
  cliCommand = `
  @inputs
  - Video Data
  - View Mode [default | mini]
  `;
}
