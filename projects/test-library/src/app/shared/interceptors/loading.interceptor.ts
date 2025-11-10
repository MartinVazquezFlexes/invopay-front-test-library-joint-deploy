import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, delay, finalize } from 'rxjs';
import { environment } from 'src/environments/environment';

import { LoadingService } from '../services/loading.service';
import { HttpContextToken } from '@angular/common/http';

export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private countRequest = 0;
  api = environment.api;
  constructor(private loadingService: LoadingService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.context.get(SKIP_LOADING)) {
      return next.handle(request);
    }
    if (!this.countRequest) {
      this.loadingService.setLoadingState(true);
    }
    this.countRequest++;
    return next.handle(request).pipe(
      // delay(delaySeconds),
      finalize(() => {
        this.countRequest--;
        // If this was the last request, removes the spinner
        if (!this.countRequest) {
          this.loadingService.setLoadingState(false);
        }
      })
    );
  }
}
