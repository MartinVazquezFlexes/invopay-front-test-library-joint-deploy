export interface PendingRevenue {
  id:string
  brokerName: string;
  customerName: string;
  productName: string;
  policyNumber: string;
  installmentNumber: number;
  currency: string;
  revenueAmount: number;
  premiumAmount: number;
  dueDate: string; // formato ISO 8601 (ej: "2025-11-06T17:46:08.853Z")
  revenueDate:string;
  paymentProvider: string,
  paymentChannel: string,
  isConsolidated: string
}

