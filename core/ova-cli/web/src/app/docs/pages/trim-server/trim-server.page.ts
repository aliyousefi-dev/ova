import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'doc-trim-server',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trim-server.page.html',
})
export class DocTrimServerPage {
  Urlanatomy = `
  http://localhost:4200/watch/e6d439b63f6363f3f93ca9b45dac6b6268a1a49d88f560aebe541eee96404994
  `;

  VideoIdSample = `
  e6d439b63f6363f3f93ca9b45dac6b6268a1a49d88f560aebe541eee96404994
  `;
}
