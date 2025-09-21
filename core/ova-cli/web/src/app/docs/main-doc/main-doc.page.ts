import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { NavbarDocComponent } from '../navbar-doc/navbar-doc.page';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs';
import { DocSearchBarComponent } from '../search-bar/search-bar';

@Component({
  selector: 'app-main-doc-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    RouterModule,
    NavbarDocComponent,
    BreadcrumbsComponent,
    DocSearchBarComponent,
  ],
  templateUrl: './main-doc.page.html',
})
export class MainDocPage {}
