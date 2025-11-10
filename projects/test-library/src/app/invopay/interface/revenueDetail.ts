import { PolicyData } from "./policyData";

export interface RevenueDetail {
  transactionData: TransactionData;
  conciliationData: ConciliationData;
  policyData: PolicyData;
}

export interface TransactionData {
  revenueDate: string;
  currency: string;
  amount: number;
  paymentProvider: string;
  paymentChannel: string;
  transactionObservations: string;
}

export interface ConciliationData {
  isConsolidated: boolean;
  productName: string;
  policyNumber: string;
  policyAmount: number;
  paymentNumber: number;
  paymentValue: number;
  brokerName: string;
}