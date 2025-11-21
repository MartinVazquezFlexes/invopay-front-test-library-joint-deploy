// --- Interfaces de API (Respuesta cruda de la API) ---

/** El objeto Producto tal como viene en el array 'content' de la API */
export interface ApiProduct {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  logoUrl: string;
  longDescription: string;
  code: string;
  logoFile: string;
  documents: ApiDocument[]
  deletable: boolean;
  editable: boolean;
}

/** La respuesta de paginación completa de la API (con datos crudos) */
export interface ApiProductPage {
  content: ApiProduct[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}


// --- Interfaces de App (Lo que usa el componente) ---

/** El objeto para el FormArray de Documentación */
export interface ProductDocument {
  description: string;
  url?: string;
  filePath?: string;
}

export interface ApiDocument {
  id: number;
  fileName: string;         // <-- Esto será nuestra 'description'
  filePath: string;
  url: string;              // <-- Probablemente sea el nombre para descargar
  insuranceProductId: number;
  enterpriseId: number;
}

/** El objeto Producto como lo usa nuestra app (Mapeado desde 'ApiProduct') */
export interface ProductItem {
  id: number;
  logoUrl?: string;
  code: string;
  name: string;
  descriptionShort: string;
  descriptionDetailed?: string;
  descriptionExpanded?: string;
  isActive: boolean;
  documents: ProductDocument[];
  deletable: boolean; 
  editable: boolean;
}

/** El objeto Producto que usa el componente (con campos computados) */
export type AppProductItem = ProductItem & {
  statusText: string;
};

/** La respuesta de paginación que espera nuestro componente */
export interface AppProductPage {
  content: ProductItem[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

// --- PAYLOADS (DTOs) PARA POST/PUT ---

/** Objeto para CREAR un producto (no tiene 'id') */
export interface CreateProductDTO {
  logoUrl?: string;
  code: string;
  name: string;
  descriptionShort: string;
  descriptionDetailed?: string;
  descriptionExpanded?: string;
  isActive: boolean;
  documents: ProductDocument[];
  // (Añade cualquier otro campo que la API espere al crear)
}

/** Objeto para ACTUALIZAR un producto (sí tiene 'id') */
export interface UpdateProductDTO extends CreateProductDTO {
  id: number;
}