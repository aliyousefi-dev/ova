import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'doc-video-tags',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './video-tags.page.html',
})
export class DocVideoTagsPage {
  SessionId = `"59ef43f5-e0b6-44dc-bfee-3922b3f610fc": "user"`;
}
