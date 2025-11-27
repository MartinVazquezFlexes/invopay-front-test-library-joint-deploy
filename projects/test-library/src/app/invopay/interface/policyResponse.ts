export interface Policy {
  id: number;
  name: string;
  policyNumber: string;
  externalId: string;
  emissionDate: string;
  initDate: string;
  endDate: string;
  amount: number;
  currency: string;
  status: string;
  creationAt: string;
  updatedAt: string;
  insuranceId: number;
  insuranceName: string;
  customerId: number;
  customerName: string;
  brokerId: number;
  brokerName: string;
  saleId: number;
  deletable: boolean;
  editable: boolean;
  primeAmount: number;
}

export interface PaginationSort {
  unsorted: boolean;
  sorted: boolean;
  empty: boolean;
}

export interface PaginationPageable {
  paged: boolean;
  unpaged: boolean;
  pageNumber: number;
  pageSize: number;
  offset: number;
  sort: PaginationSort;
}

export interface PaginatedResponse<T> {
  totalElements: number;
  totalPages: number;
  pageable: PaginationPageable;
  numberOfElements: number;
  last: boolean;
  first: boolean;
  size: number;
  content: T[];
  number: number;
  sort: PaginationSort;
  empty: boolean;
}

// Tipo específico para policies
export type PolicyResponse = PaginatedResponse<Policy>;
