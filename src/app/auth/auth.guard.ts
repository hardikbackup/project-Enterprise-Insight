import { Injectable } from '@angular/core';
import {
  CanLoad,
  Route,
  UrlSegment,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivate
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {

  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const isAdmin = this.authService.isUserAdmin();
    const isAuthenticated = this.authService.isAuthenticated();
    
    if(isAuthenticated && this.authService.isPortalUser() && !state.url.startsWith("/publications")) {
      this.router.navigate(['/publications/viewer']);
    } 
    
    if (isAuthenticated && !isAdmin) {
      if ((state.url.startsWith('/metamodel') || state.url === '/administration/users' 
      || state.url === '/administration/users-groups')) {
        this.router.navigate(['/dashboard']);
      } 
      else if (state.url === '/data-connectors') {
        this.router.navigate(['/data-connectors/excel']);
      }
      return;
    }
    

    return new Promise(resolve => {
      resolve(isAuthenticated);
    });
  }
}
