import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'projects/test-library/src/environments/environment';
import { SalesResponse } from '../interface/salesResponse';
import { saleDetail } from '../interface/saleDetail';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
 private apiUrl = environment.api+'/invopay';
 

  constructor(private http: HttpClient) {}


  getSales(): Observable<SalesResponse> {
    return this.http.get<SalesResponse>(`${this.apiUrl}/sale`, {
    });
  }

  getSaleById(id: string): Observable<saleDetail> {
    return this.http.get<saleDetail>(`${this.apiUrl}/sale/${id}`);
  }
  getSaleByInstallmentId(id: string): Observable<saleDetail> {
    return this.http.get<saleDetail>(`${this.apiUrl}/sale/by-installment-prime-payment/${id}`);
  }
}