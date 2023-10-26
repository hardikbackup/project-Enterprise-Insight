import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

/**
 * This will append jwt token for the http requests.
 *
 * @export
 * @class JwtInterceptor
 * @implements {HttpInterceptor}
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {

    constructor(public router: Router, private authService: AuthService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler) {
        let requestUrl = request.url;
        // console.log('URL ' + requestUrl);
        if (requestUrl.endsWith('/api/login')
            || requestUrl.endsWith('/auth/get-new-token')
            || requestUrl.endsWith('/public/publication/view')
            || requestUrl.endsWith('/public/publication/linked/objects')) {
            return next.handle(request);
        }
        let authToken = this.authService.getAuthToken();
        if (authToken === undefined || authToken === 'undefined' || authToken === '') {
            this.router.navigateByUrl('auth/logout');
        }

        //All URL's must be authenticated
        const authReq = request.clone({
            headers: request.headers.set('Authorization', `Bearer ${authToken}`)
        });

        return next.handle(authReq).pipe(
            map((event: HttpEvent<any>) => {
                return event;
            }),
            catchError((error: HttpErrorResponse) => {
                console.log('API Error')
                console.log(error)
                if (error.status === 401 || error.status === 403) {
                    this.router.navigateByUrl('auth/logout');
                }
                return throwError(error);
            }));
    }

}