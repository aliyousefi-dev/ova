import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodePreviewComponent } from '../../code-preview/code-preview';

@Component({
  selector: 'doc-video-info',
  standalone: true,
  imports: [CommonModule, FormsModule, CodePreviewComponent],
  templateUrl: './video-info.page.html',
})
export class DocVideoInfoPage {
  VideoinfoCli = `ovacli tools videoinfo <video-path>`;
}
