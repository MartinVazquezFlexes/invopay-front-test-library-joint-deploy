import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin, EMPTY, Subject, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { IpAuthService } from './ip-auth.service';
import { AbstractControl, ValidationErrors, ValidatorFn, FormArray } from '@angular/forms';
import { environment } from '../../../environments/environment';

import {
  ApiProductPage,
  AppProductPage,
  ProductItem,
  ApiProduct,
  ProductDocument,
  ApiDocument
} from '../interface/product-interfaces';

export interface DocumentUploadPayload {
  file: File;
  description: string;
}
@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private serverBaseUrl = environment.api;
  private apiUrl = `${this.serverBaseUrl}/invopay/insurance-products`;
  private documentsUrl=this.apiUrl + '/documents';
  private readonly productsApi = this.serverBaseUrl + '/invopay/insurance-products/all';

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

  getAllProducts(): Observable<any> {
    return this.http.get<any>(this.productsApi);
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

  uploadDocumentFile(file: File): Observable<{ filePath: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(`${this.apiUrl}/documents`, formData).pipe(
      map(response => {
        
        console.log('--- RESPUESTA DE SUBIDA (POST) ---', response);

        if (response && response.filePath) {
          return response;
        }

        return { filePath: response };
      })
    );
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
        description: doc.fileName,
        url: `${this.serverBaseUrl}/files/download-by-token?filename=${doc.filePath}&token=${currentToken}`,
        filePath: doc.filePath
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

createProductWithBatchUpload(productData: any, logoFile: File, documents: DocumentUploadPayload[]): Observable<any> {
    
    if (!documents || documents.length === 0) {
      return this.createProductFinalStep(productData, logoFile, []);
    }

    const uploadTasks = documents.map(doc => 
      this.uploadDocumentFile(doc.file).pipe(
        map(response => ({
          fileName: doc.description,
          filePath: response.filePath
        }))
      )
    );

    return forkJoin(uploadTasks).pipe(
      switchMap((uploadedDocs) => {
        return this.createProductFinalStep(productData, logoFile, uploadedDocs);
      }),
      catchError(err => {
        console.error('Error en la subida de archivos', err);
        return throwError(() => err);
      })
    );
  }
  private uploadSingleDocument(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(this.documentsUrl, formData);
  }
  private createProductFinalStep(productData: any, logoFile: File, uploadedDocs: any[]): Observable<any> {
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

    if (uploadedDocs && uploadedDocs.length > 0) {
      formData.append('documents', JSON.stringify(uploadedDocs));
    }

    console.log('📦 Enviando POST Producto con docs:', uploadedDocs);
    
    return this.http.post<any>(this.apiUrl, formData);
  }

  updateProductWithBatchUpload(productData: any, logoFile: File | null, allDocuments: any[]): Observable<any> {
    
    const oldDocs = allDocuments.filter(d => d.filePath && !d.fileRaw);
    console.log('📦 Enviando PUT Producto con docs:', oldDocs);
    const newDocs = allDocuments.filter(d => d.fileRaw && d.fileRaw instanceof File);
    console.log('📦 Enviando PUT Producto con docs:', newDocs);
    if (newDocs.length === 0) {
      const cleanData = { ...productData, documents: [] };
      console.log('📦 Enviando PUT Producto sin docs:', cleanData);
      return this.updateProductBase(cleanData, logoFile);
    }

    const uploadTasks = newDocs.map(doc => 
      this.uploadDocumentFile(doc.fileRaw).pipe(
        map(response => ({
          fileName: doc.description,
          filePath: response.filePath
        }))
      )
    );

    return forkJoin(uploadTasks).pipe(
      switchMap((uploadedNewDocs) => {
        const finalDocsList = [...uploadedNewDocs];
        
        console.log('📦 Lista fusionada de docs para Update:', finalDocsList);

        const cleanData = { ...productData, documents: finalDocsList };
        return this.updateProductBase(cleanData, logoFile);
      }),
      catchError(err => {
        console.error('Error subiendo documentos nuevos', err);
        return throwError(() => err);
      })
    );
  }

  private updateProductBase(productData: any, logoFile: File | null): Observable<any> {
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

    if (productData.longDescription) formData.append('longDescription', productData.longDescription);
    if (productData.externalId) formData.append('externalId', productData.externalId);
    if (productData.insuranceEnterprise) formData.append('insuranceEnterprise', productData.insuranceEnterprise);

    if (productData.documents && productData.documents.length > 0) {
      const docsPayload = productData.documents.map((doc: any) => ({
        fileName: doc.fileName || doc.description,
        filePath: doc.filePath
      }));
      formData.append('documents', JSON.stringify(docsPayload));
    }

    return this.http.put<any>(this.apiUrl, formData); 
  }

  deleteProduct2(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

export function uniqueDocumentNamesValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formArray = control as FormArray;
    if (!formArray || !formArray.controls) return null;

    const names = formArray.controls
      .map(group => group.get('description')?.value?.trim().toLowerCase())
      .filter(name => name); 

    const hasDuplicates = new Set(names).size !== names.length;

    return hasDuplicates ? { duplicateNames: true } : null;
  };

  
}