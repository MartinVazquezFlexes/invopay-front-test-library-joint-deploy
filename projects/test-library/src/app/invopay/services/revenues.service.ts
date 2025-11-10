import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../interface/ip-page-response';
import { FindAllRevenueResponse } from '../interface/revenues';
import { QueryParams } from './pagination.service';

@Injectable({
    providedIn: 'root'
})
export class RevenuesService {
    private baseApi: string = environment.api;
    private api: string = `${this.baseApi}/invopay/revenue`;

    constructor(
        private readonly httpClient: HttpClient
    ) {

    }

    getRevenues(queryParameters: QueryParams): Observable<PageResponse<FindAllRevenueResponse>> {
        return this.httpClient.get<PageResponse<FindAllRevenueResponse>>(`${this.api}`, {
            params: new HttpParams({ fromObject: queryParameters })
        });
    }

}