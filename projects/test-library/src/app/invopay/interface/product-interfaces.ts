
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

export interface ApiProductPage {
  content: ApiProduct[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export interface ApiDocument {
  id: number;
  fileName: string;         
  filePath: string;
  url: string;              
  insuranceProductId: number;
  enterpriseId: number;
}

export interface AppProductPage {
  content: ProductItem[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

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

export type AppProductItem = ProductItem & {
  statusText: string;
};

export interface ProductDocument {
  description: string;
  url?: string;
  filePath?: string;
}

export interface CreateProductDTO {
  logoUrl?: string;
  code: string;
  name: string;
  descriptionShort: string;
  descriptionDetailed?: string;
  descriptionExpanded?: string;
  isActive: boolean;
  documents: ProductDocument[];
}

export interface UpdateProductDTO extends CreateProductDTO {
  id: number;
}