import { PolicyData } from "../../shared/models/policyData";

export interface showData {
  transactionData: TransactionData|null;
  conciliationData: ConciliationData|null;
  policyData: PolicyData|null;
}

export interface TransactionData {
  revenueDate: string;
  currency: string;
  amount: string;
  paymentProvider: string;
  paymentChannel: string;
  transactionObservations: string;
}

export interface ConciliationData {
  isConsolidated: string;
  productName: string;
  policyNumber: string;
  policyAmount: number;
  paymentNumber: number;
  paymentValue: number;
  brokerName: string;
}