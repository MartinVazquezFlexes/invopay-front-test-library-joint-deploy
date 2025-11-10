// Modelo de venta individual
export interface Sale {
  isPaid: unknown;
  id: number;
  amount: number;
  saleDate: string;
  currency: string;
  customerId: string;
  customerName: string;
  brokerId: number;
  brokerName: string;
  brokerNameBussiness: string;
  productId: string;
  productName: string;
  policyAmount: number;
  policyNumber: string;
  premiumPaymentInstallments: number;
  premiumAmount: number;
}
