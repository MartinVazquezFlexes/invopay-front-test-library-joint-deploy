export interface IpGoalsResponse {
  totalElements: number;
  totalPages: number;
  pageable: {
    paged: boolean;
    unpaged: boolean;
    pageNumber: number;
    pageSize: number;
    offset: number;
    sort: {
      unsorted: boolean;
      sorted: boolean;
      empty: boolean;
    };
  };
  last: boolean;
  numberOfElements: number;
  first: boolean;
  size: number;
  content: IpGoalItem[];
  number: number;
  sort: {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
  };
  empty: boolean;
}

export interface IpGoalItem {
  id: number;
  name: string;
  period: string;
  startDate: string;
  endDate: string;
  newPoliciesPercentage: number;
  newPremiumsPercentage: number;
  portfolioGrowthPercentage: number;
  degreeOfGoalCompletion: number;
  degreeOfGoalName: string;
  isActive: boolean;
  creationTime: string;
  lastUpdate: string;
  incentiveCategoryId: number;
  enterpriseId: number;
  categoryName?: string;
}
