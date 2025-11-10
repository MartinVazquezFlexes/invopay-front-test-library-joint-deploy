// Modelo de paginación
export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: Sort;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}
// Modelo de ordenamiento
export interface Sort {
  unsorted: boolean;
  sorted: boolean;
  empty: boolean;
}