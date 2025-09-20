import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'doc-breadcrumbs',
  templateUrl: './breadcrumbs.html',
  imports: [],
})
export class BreadcrumbsComponent {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private routeParamsSub?: Subscription;

  ngOnInit() {
    this.routeParamsSub = this.activatedRoute.url.subscribe((url) => {
      console.log('Product ID:', url);
    });
  }
}
