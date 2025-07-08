// app/reuse-strategy.ts
import {
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  RouteReuseStrategy,
} from '@angular/router';

export class CustomReuseStrategy implements RouteReuseStrategy {
  handlers: { [key: string]: DetachedRouteHandle } = {};

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return route.routeConfig?.path === 'videos';
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    this.handlers[route.routeConfig?.path!] = handle;
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return !!this.handlers[route.routeConfig?.path!];
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return this.handlers[route.routeConfig?.path!] || null;
  }

  shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot
  ): boolean {
    return future.routeConfig === curr.routeConfig;
  }
}
