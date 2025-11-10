import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'projects/test-library/src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SchemeService {

//private readonly baseUrl = 'https://api.130.211.34.27.nip.io/api/v1/invopay/';
api: string = environment.api;

constructor(private http: HttpClient) {}

//GetAll
getSchemes(){
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


}
