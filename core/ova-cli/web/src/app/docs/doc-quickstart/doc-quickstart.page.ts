import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-doc-quickstart-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doc-quickstart.page.html',
})
export class DocQuickStartPage {}
