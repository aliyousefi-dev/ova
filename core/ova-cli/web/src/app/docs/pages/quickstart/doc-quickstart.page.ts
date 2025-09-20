import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodePreviewComponent } from '../../code-preview/code-preview';

@Component({
  selector: 'app-doc-quickstart-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CodePreviewComponent],
  templateUrl: './doc-quickstart.page.html',
})
export class DocQuickStartPage {
  initCommand = `
  ovacli init .
  `;

  indexCommand = `
  ovacli index
  `;

  cookCommand = `
  ovacli cook
  `;
}
