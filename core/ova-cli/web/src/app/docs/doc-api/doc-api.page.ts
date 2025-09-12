import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-doc-api-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doc-api.page.html',
})
export class DocAPIPage {}
