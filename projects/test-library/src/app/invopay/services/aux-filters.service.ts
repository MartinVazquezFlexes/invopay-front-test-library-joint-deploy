import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'projects/test-library/src/environments/environment';
import { map, Observable } from 'rxjs';
import { BrokersResponse } from '../interface/brokerResponse';
import { Broker } from '../interface/broker';

@Injectable({
  providedIn: 'root'
})
export class AuxFiltersService {

  
   private readonly apiBrokers:string=environment.api+'/invopay/enterprises/brokers'
    constructor(private http: HttpClient) {}
  
         getAuxBrokers(): Observable<Broker[]> {
          return this.http.get<any[]>(`${this.apiBrokers}`).pipe(
            map(brokers =>
              brokers.map(b => ({
                id: b.id,
                username: b.username
              }))
            )
          );
      }
      getAuxClients(): Observable<BrokersResponse>{
         const headers = new HttpHeaders({
          'Authorization': `Bearer `,
          'Content-Type': 'application/json'
        });
            
        return this.http.get<BrokersResponse>(environment.api+'invopay/enterprises/brokers', {headers});

      }
      getAuxProducts(): Observable<BrokersResponse>{
         const headers = new HttpHeaders({
          'Authorization': `Bearer `,
          'Content-Type': 'application/json'
        });
            
        return this.http.get<BrokersResponse>(environment.api+'invopay/enterprises/brokers', {headers});

      }
  



}