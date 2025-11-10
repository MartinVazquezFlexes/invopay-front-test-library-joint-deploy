export interface Revenue {
  id: number;
  revenueDate: string; 
  currency: string;
  revenueAmount: number;
  paymentProvider: string;
  paymentChannel: string;
  isConsolidated: boolean;
  policyNumber: string;
  productName: string;
  premiumAmount: number;
  brokerName: string;
}
