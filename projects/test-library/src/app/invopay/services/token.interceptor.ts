import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError } from 'rxjs';
import IpErrorResponse from '../interface/ip-error-response';
import { IpAuthService } from './ip-auth.service';
import { IpSnackbarService } from './ip-snackbar.service';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(
    private ipAuthService: IpAuthService,
    private ipSnackbarService: IpSnackbarService,
    private router: Router,
  ) { }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    console.log('TokenInterceptor called');
    let clonedRequest = request;
    const token = this.ipAuthService.getToken();
    if (token) {
      const language = localStorage.getItem('language') || 'en';
      clonedRequest = request.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
        },
      });
    }
    return next.handle(clonedRequest).pipe(
      catchError((error: IpErrorResponse) => {
        const token = this.ipAuthService.getToken();
        if (token) {
          if (error.status === 401) {
            this.ipSnackbarService.showErrorMessage(error, true);
            this.ipAuthService.logOut();
          }
          else if (error.status === 403) {
            // WARNING: this isn't being returned as expected (keep commented)
            // this.router.navigateByUrl('/invopay/dashboard');
          }
        }
        // this.ipSnackbarService.showErrorMessage(error);
        throw error;
      })
    );
  }
}
