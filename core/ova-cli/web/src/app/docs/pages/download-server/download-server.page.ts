import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CodePreviewComponent } from '../../code-preview/code-preview';

@Component({
  selector: 'doc-download-server',
  standalone: true,
  imports: [CommonModule, FormsModule, CodePreviewComponent],
  templateUrl: './download-server.page.html',
})
export class DocDownloadServerPage {
  Urlanatomy = `
  http://localhost:4200/watch/e6d439b63f6363f3f93ca9b45dac6b6268a1a49d88f560aebe541eee96404994
  `;

  VideoIdSample = `
  e6d439b63f6363f3f93ca9b45dac6b6268a1a49d88f560aebe541eee96404994
  `;
}
