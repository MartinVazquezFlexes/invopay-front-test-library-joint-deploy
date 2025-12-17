import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'projects/test-library/src/environments/environment';
import { map, Observable } from 'rxjs';
import { PaginatedResponse, CommissionSchemeInstance } from '../interface/scheme';
import { SelectOption } from '../interface/create-scheme-instance';
import { TranslateService } from '@ngx-translate/core';
@Injectable({
  providedIn: 'root'
})
export class SchemeService {

  //private readonly baseUrl = 'https://api.130.211.34.27.nip.io/api/v1/invopay/';
  api: string = environment.api;
  schemesApi: string = this.api + '/invopay/commission/commission-scheme-instances';
  allSchemesApi: string = this.api + '/invopay/commission-schemes/all';
  allScopesApi: string = this.api + '/invopay/commission/commission-scheme-instances/scopes/all';
  incentiveCategoriesApi: string = this.api + '/invopay/commission/incentive-categories/all';
  brokersApi: string = this.api + '/invopay/enterprises/brokers';

  constructor(private http: HttpClient, private translate: TranslateService) { }

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
    return this.http.get<any>(this.schemesApi + '?size=100');
  }

  getAllScopes(): Observable<any> {
    return this.http.get<any>(this.allScopesApi);
  }

  getScopesOptions(): Observable<SelectOption[]> {
    return this.http.get<string[]>(this.allScopesApi).pipe(
      map(response => {
        return response.map(scheme => {
          const i18nKey = `IP.COMISSION_SCHEME.SCOPES.${scheme}`;
          const translatedType = this.translate.instant(i18nKey);

          return {
            label: `${translatedType}`,
            value: scheme
          };
        });
      })
    );
  }

  getAllSchemes(): Observable<any> {
    return this.http.get<any>(this.allSchemesApi);
  }

  getSchemesOptions(): Observable<SelectOption[]> {
    return this.http.get<any[]>(this.allSchemesApi).pipe(
      map(response => {
        return response.map(scheme => {
          const i18nKey = `IP.COMISSION_SCHEME.SCHEMA-TYPES.${scheme.schemaType}`;
          const translatedType = this.translate.instant(i18nKey);

          return {
            label: `${scheme.name} (${translatedType})`,
            value: scheme.id
          };
        });
      })
    );
  }

  getAllIncentiveCategories(): Observable<any> {
    return this.http.get<any>(this.incentiveCategoriesApi);
  }

  getIncentiveCategoriesOptions(): Observable<SelectOption[]> {
    return this.http.get<any[]>(this.incentiveCategoriesApi).pipe(
      map(cats => cats.map(c => ({ label: c.name, value: c.id })))
    );
  }

  getAllBrokers(): Observable<any> {
    return this.http.get<any>(this.brokersApi);
  }

  /**
   * POST: Crear nueva instancia
   */
  createSchemeInstance(payload: any): Observable<any> {
    return this.http.post<any>(this.schemesApi, payload);
  }

  /**
   * PUT: Editar instancia (Lo dejamos listo por si acaso)
   */
  updateSchemeInstance(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.schemesApi}/${id}`, payload);
  }
}
