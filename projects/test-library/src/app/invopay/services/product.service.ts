import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';// 1. Importa el entorno
import { IpAuthService } from './ip-auth.service';

// 2. Importa las interfaces del archivo separado
import {
  ApiProductPage,
  AppProductPage,
  ProductItem,
  ApiProduct,
  CreateProductDTO,
  UpdateProductDTO
} from '../interface/product-interfaces'; // (Ajusta esta ruta)

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  // 3. Lee la URL Base del entorno
  private serverBaseUrl = 'https://api.130.211.34.27.nip.io'; 
  
  // 4. Construye la URL completa de la API
  private apiUrl = `${this.serverBaseUrl}/api/v1/invopay/insurance-products`;

  constructor(private http: HttpClient, private authService: IpAuthService) { }

  /**
   * GET: Obtiene la lista paginada de productos.
   */
  getProducts(page: number, size: number): Observable<AppProductPage> {
     return this.http.get<ApiProductPage>(`${this.apiUrl}?page=${page}&size=${size}`).pipe(
       map((apiResponse: ApiProductPage) => {
        
        console.log('--- JSON RECIBIDO (GET) ---');
        console.log(JSON.stringify(apiResponse, null, 2));

        const mappedContent: ProductItem[] = apiResponse.content.map(
          (apiProduct: ApiProduct) => this.mapApiToProductItem(apiProduct)
        );

        return {
          totalPages: apiResponse.totalPages,
          totalElements: apiResponse.totalElements,
          number: apiResponse.number,
          size: apiResponse.size,
          content: mappedContent
        };
       })
     );
  }

  /**
   * POST: Crea un nuevo producto (Todo en FormData).
   */
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

  /**
   * PUT: Actualiza un producto existente (Todo en FormData).
   */
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
    formData.append('isActive', productData.isActive ? '1' : '0'); // Envía 1 o 0
    
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

  /**
   * DELETE: Realiza una eliminación.
   * La API responde con 204 No Content (vacío).
   */
  deleteProduct(id: number): Observable<Object> {
    const deleteUrl = `${this.apiUrl}/${id}`; 
    return this.http.delete(deleteUrl); // Espera una respuesta vacía
  }


  /**
   * Mapeador centralizado (API -> App).
   */
  // En product.service.ts

  private mapApiToProductItem(apiProduct: ApiProduct): ProductItem {
    
    let finalLogoUrl: string | undefined = undefined;

    if (apiProduct.logoUrl) {
      
      let filename: string = apiProduct.logoUrl;

      // --- 1. LÓGICA DE LIMPIEZA ---
      // Si el logoUrl ya es una URL (dato corrupto), extraemos el 'filename' real
      try {
        if (apiProduct.logoUrl.startsWith('http')) {
          const url = new URL(apiProduct.logoUrl);
          filename = url.searchParams.get('filename') || apiProduct.logoUrl;
        }
      } catch (e) {
        // Falló el parseo, lo más probable es que sea solo el nombre del archivo
        filename = apiProduct.logoUrl;
      }
      // --- FIN DE LÓGICA DE LIMPIEZA ---


      // --- 2. LÓGICA DE AUTENTICACIÓN ---
      // (Asumo que tu authService tiene un método 'getToken()')
      const currentToken = this.authService.getToken(); 
      if (!currentToken) {
        console.error("Error: No se pudo obtener el token de autenticación para la imagen.");
      }
      // --- FIN LÓGICA DE AUTENTICACIÓN ---


      // 3. CONSTRUCCIÓN DE URL (La forma correcta)
      finalLogoUrl = `${this.serverBaseUrl}/api/v1/files/download-by-token?filename=${filename}&token=${currentToken}`;
    }

    console.log(`[ProductService Mapeo] ID: ${apiProduct.id}, URL Generada: ${finalLogoUrl}`);

    return {
      id: apiProduct.id,
      name: apiProduct.name,
      code: apiProduct.code,
      logoUrl: finalLogoUrl, // Asigna la URL generada
      isActive: apiProduct.isActive,
      descriptionShort: apiProduct.description,
      descriptionDetailed: apiProduct.longDescription,
      documentation: [], 
      descriptionExpanded: '', 
      deletable: apiProduct.deletable,
      editable: apiProduct.editable
    };
  }
}