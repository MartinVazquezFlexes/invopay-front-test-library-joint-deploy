export interface ObjectiveItem {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  newPoliciesPercentage: number;
  newPremiumsPercentage: number;
  portfolioGrowthPercentage: number;
  isActive: boolean;
  creationTime: string;
  lastUpdate: string;
  incentiveCategoryId: number;
  enterpriseId: number;
  categoryName?: string;
}

export interface Category{
  id: number,
  name: string,
  creationTime: Date,
  lastUpdate: Date,
  isActive: boolean,
  enterpriseId: number,
  deletable: boolean,
  editable: boolean,
  code: string
}

export interface ObjectiveListConfig {
  title: string;
  columns: string[];
  actions: string[];
  tableStyle: string;
}

export interface ObjectiveListResponse {
  totalPages: number;
  totalElements: number;
  first: boolean;
  numberOfElements: number;
  last: boolean;
  size: number;
  content: ObjectiveItem[];
  number: number;
  sort: Sort;
  pageable: Pageable;
  empty: boolean;
}

export interface Sort {
  unsorted: boolean;
  empty: boolean;
  sorted: boolean;
}

export interface Pageable {
  paged: boolean;
  unpaged: boolean;
  offset: number;
  sort: Sort;
  pageNumber: number;
  pageSize: number;
}

export interface GoalsItem {
  id: number;
  name: string;
  period: string;
  categoryBroker: string;
  startDate: string;
  endDate: string;
  newPolicies:number;
  newPrimus:number;
  wallet:number;
  grade:string;
  status: string;
}