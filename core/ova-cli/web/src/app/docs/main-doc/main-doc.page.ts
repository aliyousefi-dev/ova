import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { NavbarDocComponent } from '../navbar-doc/navbar-doc.page';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs';
import { DocSearchBarComponent } from '../search-bar/search-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatPaginatorModule } from '@angular/material/paginator';

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
    MatSidenavModule,
    MatButtonModule,
    MatPaginatorModule,
  ],
  templateUrl: './main-doc.page.html',
})
export class MainDocPage {
  showFiller = false;
  drawerMode: 'over' | 'side' = 'side';
  drawerOpened = true;

  constructor() {
    this.updateDrawerMode();
  }

  ngOnInit() {
    this.updateDrawerMode();
    window.addEventListener('resize', this.updateDrawerMode.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.updateDrawerMode.bind(this));
  }

  private updateDrawerMode() {
    if (window.innerWidth < 1024) {
      this.drawerMode = 'over';
      this.drawerOpened = false;
    } else {
      this.drawerMode = 'side';
      this.drawerOpened = true;
    }
  }
}
