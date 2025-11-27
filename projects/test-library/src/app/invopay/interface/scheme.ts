//Scheme
export interface SchemeParameters {
  percentage: number;
}

export interface Scheme {
  id: number;
  name: string;
  description: string;
  longDescription: string | null;
  enterpriseId: number;
  externalId: string;
  isActive: boolean;
  parameters: SchemeParameters;
  schemaType: 'PERCENTAGE' | 'FIXED' | string; //ver tipos
}

//SchemeDetails
export interface SchemeDetails {
  id: number;
  externalId: string;
  name: string;
  description: string;
  parameters: string;
  schemaType: string;
  enterpriseId: number;
  isActive: boolean;
  longDescription: string;
}

export interface CommissionSchemeInstance {
  id: number;
  name: string;
  commissionSchemeId: number;
  byBroker: boolean;
  byProduct: boolean;
  hasIncentiveScheme: boolean;
  createdByUserId: number;
  creationDate: string; // O Date si usás un interceptor para parsear fechas
  lastUpdate: string | null;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  enterpriseId: number;
  deletable: boolean;
  editable: boolean;
  schemaType: string;        // Corresponde a 'Tipo de esquema'
  scope: string;             // Corresponde a 'Ámbito de regla'
  commissionPercentage: number; // Corresponde a '% Prima'
  
  isActiveText?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}