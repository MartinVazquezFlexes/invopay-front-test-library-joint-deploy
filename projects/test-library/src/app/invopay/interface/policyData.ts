export interface PolicyData {
  number: string;
  amount: number;
  saleDate: string;
  productName: string;
  premiumAmount: number;
  premiumPaymentInstallments: number | null;
  premiumPaymentPlan: PremiumPaymentPlan[];
}
export interface PremiumPaymentPlan {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  isPaid: boolean | null;
}