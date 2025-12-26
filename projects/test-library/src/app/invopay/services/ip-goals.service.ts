import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'projects/test-library/src/environments/environment';
import { Observable } from 'rxjs';
import { IpGoalsResponse } from '../interface/ip-goals-response';
import Pageable from '../interface/ip-pageable';

@Injectable({
  providedIn: 'root'
})
export class IpGoalsService {

  constructor() { }
  api:string=environment.api+'/invopay/enterprise-goals'
  private readonly http=inject(HttpClient)

  getAllGoals(pageable:Pageable):Observable<IpGoalsResponse>{
    return this.http.get<IpGoalsResponse>(`${this.api}?page=${pageable.page}&size=${pageable.size}&sort=`)
  }
}
