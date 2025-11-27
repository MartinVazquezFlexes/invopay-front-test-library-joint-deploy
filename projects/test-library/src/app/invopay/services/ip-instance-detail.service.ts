import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'projects/test-library/src/environments/environment';
import { Observable } from 'rxjs';
import { Instance } from '../interface/ip-instance-detail';

@Injectable({
  providedIn: 'root'
})
export class IpInstanceDetailService {

  constructor() { }
  private readonly http=inject(HttpClient);
  api:string=environment.api+'/invopay/commission/commission-scheme-instances'

  getInstance(id:number):Observable<Instance>{
    return this.http.get<Instance>(`${this.api}/${id}`);
  }
}
