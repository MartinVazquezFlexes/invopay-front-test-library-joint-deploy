import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin, EMPTY, Subject } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { IpAuthService } from './ip-auth.service';
import { environment } from '../../../environments/environment';

import {
  ApiProductPage,
  AppProductPage,
  ProductItem,
  ApiProduct,
  ProductDocument,
  ApiDocument
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

    if (productData.documents && productData.documents.length > 0) {
      const docsPayload = productData.documents.map((doc: ProductDocument) => ({
        fileName: doc.description,
        filePath: doc.filePath
      }));
      
      formData.append('documents', JSON.stringify(docsPayload));
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

    if (productData.documents && productData.documents.length > 0) {
      const docsPayload = productData.documents.map((doc: ProductDocument) => ({
        fileName: doc.description,
        filePath: doc.filePath
      }));
      formData.append('documents', JSON.stringify(docsPayload));
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

  deleteDocument(productId: number, documentName: string): Observable<Object> {
    const params = new HttpParams()
      .set('insuranceProductId', productId.toString())
      .set('documentName', documentName);

    return this.http.delete(`${this.apiUrl}/documents`, { params });
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
    const mappedDocs: ProductDocument[] = (apiProduct.documents || []).map((doc: ApiDocument) => {
      return {
        description: doc.fileName, // La API llama 'fileName' a lo que nosotros llamamos descripción/nombre visible
        url: `${this.serverBaseUrl}/files/download-by-token?filename=${doc.filePath}&token=${currentToken}`, // Generamos el link de descarga
        filePath: doc.filePath // Guardamos el path original
      };});
    console.log(`[ProductService Mapeo] ID: ${apiProduct.id}, URL Generada: ${finalLogoUrl}`);

    return {
      id: apiProduct.id,
      name: apiProduct.name,
      code: apiProduct.code,
      logoUrl: finalLogoUrl,
      isActive: apiProduct.isActive,
      descriptionShort: apiProduct.description,
      descriptionDetailed: apiProduct.longDescription,
      documents: mappedDocs,
      descriptionExpanded: '',
      deletable: apiProduct.isActive,
      editable: apiProduct.isActive
    };
  }

  uploadDocumentFile(file: File): Observable<{ filePath: string }> {
    const formData = new FormData();
    formData.append('file', file);

    // 1. ELIMINAMOS { responseType: 'text' }
    // Dejamos que Angular maneje el JSON para que el Interceptor funcione.
    return this.http.post<any>(`${this.apiUrl}/documents`, formData).pipe(
      map(response => {
        
        console.log('--- RESPUESTA DE SUBIDA (POST) ---', response);

        // AHORA 'response' ya debería estar desencriptado por el interceptor.
        
        // Caso A: El backend devuelve un objeto { filePath: "..." }
        if (response && response.filePath) {
          return response;
        }

        // Caso B: El backend devuelve el string directo (nombre del archivo)
        // (Puede venir como string puro o dentro de un objeto genérico)
        return { filePath: response };
      })
    );
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