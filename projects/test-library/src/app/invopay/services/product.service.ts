import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, EMPTY, Subject } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { IpAuthService } from './ip-auth.service';
import { environment } from '../../../environments/environment';

import {
  ApiProductPage,
  AppProductPage,
  ProductItem,
  ApiProduct,
  CreateProductDTO,
  UpdateProductDTO
} from '../interface/product-interfaces';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private serverBaseUrl = environment.api;
  private apiUrl = `${this.serverBaseUrl}/invopay/insurance-products`;

  constructor(private http: HttpClient, private authService: IpAuthService) { }

  getProducts(page: number, size: number): Observable<AppProductPage> {

    return this.http.get<ApiProductPage>(`${this.apiUrl}?page=${page}&size=${size}`).pipe(

      switchMap((apiResponse: ApiProductPage) => {
        console.log('--- JSON RECIBIDO (GET) ---');
        console.log(JSON.stringify(apiResponse, null, 2));

        const mappedContent: ProductItem[] = apiResponse.content.map(
          (apiProduct: ApiProduct) => this.mapApiToProductItem(apiProduct)
        );

        if (mappedContent.length === 0) {

          return of({
            ...apiResponse,
            content: mappedContent
          });
        }

        const productWithImageObs: Observable<ProductItem>[] = mappedContent.map(product => {

          if (!product.logoUrl) {
            return of(product);
          }

          return this.http.get(product.logoUrl, { responseType: 'blob' }).pipe(
            switchMap(blob => this.convertBlobToBase64(blob)),
            map(base64String => {
              product.logoUrl = base64String;
              return product;
            }),
            catchError(() => {
              product.logoUrl = undefined;
              return of(product);
            })
          );
        });

        return forkJoin(productWithImageObs).pipe(
          map((finalProducts: ProductItem[]) => {
            return {
              ...apiResponse,
              content: finalProducts
            };
          })
        );
      })
    );
  }
  createProduct(productData: any, logoFile: File): Observable<ProductItem> {

    const formData = new FormData();

    formData.append('logoFile', logoFile, logoFile.name);
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('code', productData.code);
    formData.append('type', productData.type);

    formData.append('isActive', productData.isActive.toString());

    if (productData.longDescription) {
      formData.append('longDescription', productData.longDescription);
    }
    if (productData.externalId) {
      formData.append('externalId', productData.externalId);
    }
    if (productData.insuranceEnterprise) {
      formData.append('insuranceEnterprise', productData.insuranceEnterprise);
    }

    console.log('--- Contenido del FormData (POST) ---');
    formData.forEach((value, key) => { console.log(`${key}: `, value); });
    console.log('------------------------------------');

    return this.http.post<ApiProduct>(this.apiUrl, formData).pipe(
      map(apiProduct => this.mapApiToProductItem(apiProduct))
    );
  }

  updateProduct(productData: any, logoFile: File | null): Observable<ProductItem> {
    const formData = new FormData();

    if (logoFile) {
      formData.append('logoFile', logoFile, logoFile.name);
    }

    formData.append('id', productData.id.toString());
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('code', productData.code);
    formData.append('type', productData.type);
    formData.append('isActive', productData.isActive.toString());

    if (productData.longDescription) {
      formData.append('longDescription', productData.longDescription);
    }
    if (productData.externalId) {
      formData.append('externalId', productData.externalId);
    }
    if (productData.insuranceEnterprise) {
      formData.append('insuranceEnterprise', productData.insuranceEnterprise);
    }

    console.log('--- Contenido del FormData (PUT) ---');
    formData.forEach((value, key) => { console.log(`${key}: `, value); });
    console.log('------------------------------------');

    return this.http.put<ApiProduct>(this.apiUrl, formData).pipe(
      map(apiProduct => this.mapApiToProductItem(apiProduct))
    );
  }

  deleteProduct(id: number): Observable<Object> {
    const deleteUrl = `${this.apiUrl}/${id}`;
    return this.http.delete(deleteUrl);
  }

  deactivateProduct(id: number): Observable<Object> {
    const patchUrl = `${this.apiUrl}/${id}/activation`;
    return this.http.patch(patchUrl, {});
  }

  private mapApiToProductItem(apiProduct: ApiProduct): ProductItem {
    const currentToken = this.authService.getToken();
    let finalLogoUrl: string | undefined = undefined;

    if (apiProduct.logoUrl) {

      let filename: string = apiProduct.logoUrl;
      try {
        if (apiProduct.logoUrl.startsWith('http')) {
          const url = new URL(apiProduct.logoUrl);
          filename = url.searchParams.get('filename') || apiProduct.logoUrl;
        }
      } catch (e) {
        filename = apiProduct.logoUrl;
      }
      if (!currentToken) {
        console.error("Error: No se pudo obtener el token de autenticación para la imagen.");
      }

      finalLogoUrl = `${this.serverBaseUrl}/files/download-by-token?filename=${filename}&token=${currentToken}`;
    }

    console.log(`[ProductService Mapeo] ID: ${apiProduct.id}, URL Generada: ${finalLogoUrl}`);

    return {
      id: apiProduct.id,
      name: apiProduct.name,
      code: apiProduct.code,
      logoUrl: finalLogoUrl,
      isActive: apiProduct.isActive,
      descriptionShort: apiProduct.description,
      descriptionDetailed: apiProduct.longDescription,
      documentation: [],
      descriptionExpanded: '',
      deletable: apiProduct.deletable,
      editable: apiProduct.editable
    };
  }

  private convertBlobToBase64(blob: Blob): Observable<string> {
    const reader = new FileReader();
    const subject = new Subject<string>();

    reader.onloadend = () => {
      subject.next(reader.result as string);
      subject.complete();
    };

    reader.onerror = (err) => {
      subject.error(err);
    };

    reader.readAsDataURL(blob);
    return subject.asObservable();
  }
}