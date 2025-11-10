import { Pageable, Sort } from "./pageable";
import { Sale } from "./sale";

// Modelo principal de respuesta
export interface SalesResponse {
  content: Sale[];
  pageable: Pageable;
  totalPages: number;
  last: boolean;
  totalElements: number;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: Sort;
  empty: boolean;
}

