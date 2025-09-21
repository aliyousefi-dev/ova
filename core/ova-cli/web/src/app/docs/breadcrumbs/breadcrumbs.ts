import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { BreadcrumbsService } from '../breadcrumbs-service/breadcrumbs-service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'doc-breadcrumbs',
  templateUrl: './breadcrumbs.html',
  imports: [CommonModule, RouterModule],
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
  private breadcrumbsService = inject(BreadcrumbsService);
  private breadcrumbsSub?: Subscription;
  breadcrumbs: string[] = [];

  ngOnInit() {
    this.breadcrumbsSub = this.breadcrumbsService
      .getBreadcrumbs()
      .subscribe((breadcrumbs) => {
        this.breadcrumbs = breadcrumbs;
        console.log('Breadcrumbs:', breadcrumbs);
      });
  }

  ngOnDestroy() {
    this.breadcrumbsSub?.unsubscribe();
  }
}
