import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaymentProviderPageResponse } from '../interface/paymentEntities';
import { environment } from 'projects/test-library/src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ProvidersService {

constructor() { }
  private readonly http=inject(HttpClient);
 api:string=environment.api

  getPaymentsEntities():Observable<PaymentProviderPageResponse>{
    return this.http.get<PaymentProviderPageResponse>(`${this.api}/invopay/revenue/payment-entities`);
  }
}
