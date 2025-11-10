export interface PageResponse<Type> {
  totalPages: number;
  totalElements: number;
  size: number;
  content: Array<Type>;
  number: number;
  sort: SortObject;
  numberOfElements: number;
  pageable: PageableObject;
  first: boolean;
  last: boolean;
  empty: boolean;
}

interface SortObject {
  empty: boolean;
  unsorted: boolean;
  sorted: boolean;
}

interface PageableObject {
  offset: number;
  sort: SortObject;
  paged: boolean;
  unpaged: boolean;
  pageNumber: number;
  pageSize: number;
}
