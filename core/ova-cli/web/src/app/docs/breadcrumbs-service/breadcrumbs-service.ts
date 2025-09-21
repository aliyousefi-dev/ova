import { Injectable } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbsService {
  private breadcrumbs$ = new BehaviorSubject<string[]>([]);

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        const breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
        this.breadcrumbs$.next(breadcrumbs);
      });
  }

  getBreadcrumbs() {
    return this.breadcrumbs$.asObservable();
  }

  private buildBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: string[] = []
  ): string[] {
    const children: ActivatedRoute[] = route.children;
    if (children.length === 0) {
      return breadcrumbs;
    }
    for (const child of children) {
      const segments = child.snapshot.url
        .map((segment) => segment.path)
        .filter(Boolean);
      if (segments.length > 0) {
        for (const seg of segments) {
          url += `/${seg}`;
          breadcrumbs.push(seg);
        }
      }
      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }
    return breadcrumbs;
  }
}
