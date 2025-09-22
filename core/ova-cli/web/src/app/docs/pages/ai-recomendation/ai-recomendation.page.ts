import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodePreviewComponent } from '../../code-preview/code-preview';

@Component({
  selector: 'doc-ai-recomendation',
  standalone: true,
  imports: [CommonModule, FormsModule, CodePreviewComponent],
  templateUrl: './ai-recomendation.page.html',
})
export class DocAIRecomendationPage {
  SessionId = `"59ef43f5-e0b6-44dc-bfee-3922b3f610fc": "user"`;
}
