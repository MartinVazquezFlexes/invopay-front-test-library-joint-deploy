export default interface FilterValues {
  amountFrom?: number;
  amountTo?: number;
  createDateFrom?: string | null;
  createDateTo?: string | null;
  status?: string | null | string[];
  brokersId?: number[];
  statusId?: number;
  ignoreStatusIds?: number[];
  statusIds?: string[];
  billed?: boolean;
  periodId?: string;
}

export interface SettlementCloseMultipleDto {
    ids: number[];
    allSelected: boolean;
    filters?: FilterValues;
}