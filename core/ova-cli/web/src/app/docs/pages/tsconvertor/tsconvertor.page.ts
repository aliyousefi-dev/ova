import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodePreviewComponent } from '../../code-preview/code-preview';

@Component({
  selector: 'doc-changelog',
  standalone: true,
  imports: [CommonModule, FormsModule, CodePreviewComponent],
  templateUrl: './tsconvertor.page.html',
})
export class DocTsConvertorPage {
  cliCommand = `
  ovacli tsconverter <file-path> --recursive

  flags:
  --recursive it search on the folder and find all the videos and try to convert them
  `;
}
