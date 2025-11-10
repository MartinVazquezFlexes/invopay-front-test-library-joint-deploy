import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, throwError } from "rxjs";
import { IpAuthService } from "../../invopay/services/ip-auth.service";
import { DecryptionService } from "../services/decryption.service";

@Injectable()
export class DecryptionInterceptor implements HttpInterceptor {
  constructor(private decryptionService: DecryptionService, private authService: IpAuthService) { }

  //  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  //    return next.handle(req).pipe(
  //      filter((event: HttpEvent<any>): event is HttpResponse<any> => event instanceof HttpResponse),
  //      map((event: HttpResponse<any>) => {
  //          let decryptedBody;
  //          let token;
  //          let body=event.body?.response ?? '';          
  //          if (req.url.includes('/auth/authenticate') 
  //            || req.url.includes('/invopay/users/signIn')) {
  //            token = body.split('/')[0];
  //            body = body.substring(body.indexOf('/') + 1);
  //          } else {
  //            token = this.authService.getToken();
  //          }
  //          if (token && body) {
  //            try {
  //              decryptedBody = this.decryptionService.decrypt(body, token);
  //              try {                
  //                return event.clone({ body: JSON.parse(decryptedBody) });
  //              } catch (error) {
  //                return event.clone({ body: decryptedBody });                
  //              }              
  //            } catch (error) {
  //              console.error('Error al descifrar la respuesta:', error);
  //              throw new Error('Error en el proceso de descifrado.');
  //            }
  //          }
  //        return event;
  //      })
  //    );
  //  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          return this.decryptResponse(event, req);
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.error && typeof error.error === 'object' && error.error.response) {
          const encryptedBody = error.error.response;
          const token = this.getTokenFromRequest(req, encryptedBody);

          try {
            const decrypted = this.decryptionService.decrypt(encryptedBody, token);
            let parsed;
            try {
              parsed = JSON.parse(decrypted);
            } catch {
              parsed = decrypted;
            }

            const decryptedError = new HttpErrorResponse({
              error: parsed
            });

            return throwError(() => decryptedError);
          } catch (e) {
            console.error('Error al descifrar el cuerpo del error:', e);
            return throwError(() => error);
          }
        }

        return throwError(() => error);
      })
    );
  }

  private decryptResponse(event: HttpResponse<any>, req: HttpRequest<any>): HttpResponse<any> {
    let decryptedBody;
    let token;
    let body = event.body?.response ?? '';
    if (req.url.includes('/auth/authenticate')
      || req.url.includes('/invopay/users/signIn')) {
      token = body.split('/')[0];
      body = body.substring(body.indexOf('/') + 1);
    } else {
      token = this.authService.getToken();
    }
    if (token && body) {
      try {
        decryptedBody = this.decryptionService.decrypt(body, token);
        try {
          return event.clone({ body: JSON.parse(decryptedBody) });
        } catch (error) {
          return event.clone({ body: decryptedBody });
        }
      } catch (error) {
        console.error('Error al descifrar la respuesta:', error);
        throw new Error('Error en el proceso de descifrado.');
      }
    }
    return event;
  }

  private getTokenFromRequest(req: HttpRequest<any>, body: string): string {
    if (
      req.url.includes('/auth/authenticate') ||
      req.url.includes('/invopay/users/signIn')
    ) {
      const token = body.split('/')[0];
      return token;
    } else {
      const token = this.authService.getToken();
      return token as string;
    }
  }
}