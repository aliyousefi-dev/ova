import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodePreviewComponent } from '../../code-preview/code-preview';

@Component({
  selector: 'doc-roadmap',
  standalone: true,
  imports: [CommonModule, FormsModule, CodePreviewComponent],
  templateUrl: './roadmap.page.html',
})
export class DocRoadmapPage {
  featureToDev = `
    - migret channels to a global channel:
     this feature subscribe from a channel and add from channel to that channels
  `;
}
