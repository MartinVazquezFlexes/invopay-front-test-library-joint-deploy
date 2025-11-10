import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class RoleInterceptor implements HttpInterceptor {
  constructor( private router: Router ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
   
    const userRole = sessionStorage.getItem('role')!;
   
    // if (!userRole) {
    //   this.router.navigate(['/invopay/admin/dashboard']);
    //   const errorResponse = new HttpErrorResponse({
    //     error: 'Unauthorized user',
    //     status: 401, 
    //   });
    //   return throwError(errorResponse);
    // }


    request = request.clone({
      setHeaders: {
        'X-User-Role': userRole,
      },
    });

    return next.handle(request).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }
}
