import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-doc-overview-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './doc-overview.page.html',
})
export class DocOverviewPage {
  private router = inject(Router);
}
