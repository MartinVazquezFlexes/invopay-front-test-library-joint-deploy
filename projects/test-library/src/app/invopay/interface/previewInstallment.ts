export interface PreviewInstallment {
  installmentNumber: number;
  dueDate: string;          
  amount: number;
  currentCommission: number;
  newCommissionPercentage: number;
  newCommissionAmount: number;
  status: string;       
}
