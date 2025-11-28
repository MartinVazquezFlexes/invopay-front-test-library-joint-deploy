import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'projects/test-library/src/environments/environment';
import { map, Observable } from 'rxjs';
import { Broker } from '../interface/broker';
import { FilterAux } from '../interface/filterAux';
import { ProductListComponent } from '../views/product-list/product-list.component';

@Injectable({
  providedIn: 'root'
})
export class AuxFiltersService {

  
   private readonly apiBrokers:string=environment.api+'/invopay/enterprises/brokers'
   private readonly apiProducts:string = environment.api+'/invopay/insurance-products/all'
   private readonly apiClients :string=environment.api+'/invopay/customers/all'
    constructor(private http: HttpClient) {}
  
      getAuxBrokers(): Observable<FilterAux[]> {
          return this.http.get<any[]>(`${this.apiBrokers}`).pipe(
            map(brokers =>
              brokers.map(b => ({
                id: b.id,
                username: b.username
              }))
            )
          );
      }
      getAuxClients(): Observable<FilterAux[]>{
            
      return this.http.get<any[]>(`${this.apiClients}`).pipe(
            map(clients =>
              clients.map(b => ({
                id: b.id,
                username: b.fullName
              }))
            )
          );
      }
      getAuxProducts():Observable<FilterAux[]>{

      return this.http.get<any[]>(`${this.apiProducts}`).pipe(
            map(products =>
              products.map(b => ({
                id: b.id,
                username: b.name
              }))
            )
          );
      }
  



}