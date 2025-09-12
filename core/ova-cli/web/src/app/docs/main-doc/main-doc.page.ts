import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router, RouterModule } from '@angular/router';
import { DocNavbarComponent } from '../doc-navbar/doc-navbar.page';

@Component({
  selector: 'app-main-doc-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    RouterModule,
    DocNavbarComponent,
  ],
  templateUrl: './main-doc.page.html',
})
export class MainDocPage {
  private router = inject(Router);
}
