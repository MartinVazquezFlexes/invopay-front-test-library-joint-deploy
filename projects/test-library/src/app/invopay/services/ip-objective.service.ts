import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'projects/test-library/src/environments/environment';
import { Observable } from 'rxjs';
import { Category, ObjectiveItem, ObjectiveListResponse } from '../interface/objective-list.models';
import Pageable from '../interface/ip-pageable';

@Injectable({
  providedIn: 'root'
})
export class IpObjectiveService {

  constructor() { }
  private readonly http=inject(HttpClient)
  api:string=environment.api+'/invopay/enterprise-objectives'
  apiCategory=environment.api+'/invopay/commission/incentive-categories/all'
  getAllObjectives(pageable:Pageable):Observable<ObjectiveListResponse>{
    return this.http.get<ObjectiveListResponse>(`${this.api}?page=${pageable.page}&size=${pageable.size}&sort=`);
  }

  getAllCategories():Observable<Category[]>{
    return this.http.get<Category[]>(`${this.apiCategory}`);
  }
}
