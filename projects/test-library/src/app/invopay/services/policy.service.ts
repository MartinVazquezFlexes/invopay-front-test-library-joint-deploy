import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'projects/test-library/src/environments/environment';
import { Observable } from 'rxjs';
import { PolicyResponse } from '../interface/policyResponse';
import { Broker } from '../interface/broker';

@Injectable({
  providedIn: 'root'
})
export class PolicyService {

   private readonly apiUrl=  environment.api+'/invopay/insurance-policies'
    constructor(private http: HttpClient) {}
  
     getPolicies(): Observable<PolicyResponse> {
      const headers = new HttpHeaders({
          'Authorization': `Bearer `,
          'Content-Type': 'application/json'
        });
        return this.http.get<PolicyResponse>(`${this.apiUrl}`, {headers});
      }

      getPoliciesForBroker(): Observable<PolicyResponse> {
      const headers = new HttpHeaders({
          'Authorization': `Bearer `,
          'Content-Type': 'application/json'
        });
        return this.http.get<PolicyResponse>(`${this.apiUrl}`+'/broker', {headers});
      }


  

//GetById
getPolicyBrokerById(id: number): Observable<any> { //Crear models
  return this.http.get<any>(`${this.apiUrl}/${id}/broker`);
}

//GetById
getPolicyAdminById(id: number): Observable<any> { //Crear models
  return this.http.get<any>(`${this.apiUrl}/${id}`);
}

}