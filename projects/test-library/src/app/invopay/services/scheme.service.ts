import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'projects/test-library/src/environments/environment';
import { Observable } from 'rxjs';
import { PaginatedResponse, CommissionSchemeInstance } from '../interface/scheme';
@Injectable({
  providedIn: 'root'
})
export class SchemeService {

  //private readonly baseUrl = 'https://api.130.211.34.27.nip.io/api/v1/invopay/';
  api: string = environment.api;
  schemesApi: string = this.api + '/invopay/commission/commission-scheme-instances';

  constructor(private http: HttpClient) { }

  //GetAll
  getSchemes() {
    return this.http.get<any>(this.api + '/invopay/commission-schemes');
  }


  //GetById
  getSchemeById(id: number): Observable<any> { //Usar SchemeDetails
    return this.http.get<any>(`${this.api}/invopay/commission-schemes/${id}`);
  }


  //UpdateStatus
  patchScheme(id: number): Observable<any> {
    return this.http.patch<any>(`${this.api}/invopay/commission-schemes/${id}/activation`, {});
  }

  getInstances(page: number = 0, size: number = 10): Observable<PaginatedResponse<CommissionSchemeInstance>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'creationDate,desc'); // Ejemplo: ordenado por fecha, opcional

    return this.http.get<PaginatedResponse<CommissionSchemeInstance>>(this.schemesApi, { params });
  }
  getAllInstances(): Observable<any> {
    return this.http.get<any>(this.schemesApi);
  }

}
