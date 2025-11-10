import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

export class CustomReuseStrategy implements RouteReuseStrategy {

  
  private storedRoutes = new Map<string, DetachedRouteHandle>();
  private navigationHistory: string[] = []; 
  private noStorePaths = [
    "consolidated-sales",
    "sales-import",
    "payin-import", 
    'consolidated-creation-sales',
    'management',
    'home',
    'settlement-from-sale',
    'new-invoice',
    'manage-invoice',
    'pay-invoices',
    'settlement-comments',
    'settlement-details'
  ]

  private shouldCache(path: string): boolean {
    return !this.noStorePaths.includes(path);
  }

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    const path = route.routeConfig?.path;
    return path ? this.shouldCache(path) : false;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    const path = route.routeConfig?.path;
    if (path && handle) {
      this.storedRoutes.set(path, handle);

      if (!this.navigationHistory.includes(path)) {
        this.navigationHistory.push(path);
      }

      if (this.navigationHistory.length > 2) {
        
        const removed = this.navigationHistory.shift(); 
        if (removed) {
          this.storedRoutes.delete(removed);
        }
      }
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const path = route.routeConfig?.path;
    return !!path && this.storedRoutes.has(path);
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const path = route.routeConfig?.path;
    return path ? this.storedRoutes.get(path) || null : null;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }
}
