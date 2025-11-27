export interface PolicyData {
  number: string;
  amount: number;
  saleDate: string|null;
  productName: string|null;
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

//Detalle de polizas endpoint

export interface Broker {
  id: number;
  username: string;
  userEmail: string;
  userCreationDate: string;
  lastLoginDate: string;
}

export interface Customer {
  externalId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
}

export interface InsurancePolicyPremium {
  id: number;
  amount: number;
  currency: string;
  isActive: boolean;
  creationAt: string;
}

export interface PremiumPayment {
  id: number;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  installmentsNumber: number;
}

export interface InstallmentBackend {
  amount: number;
  currencyCode: string | null;
  brokerCommission: number;
  installmentNumber: number;
  dueDate: string;
  paymentDate?: string | null;
  status?: string;
}

//Endpoint entero
export interface PolicyDetailsResponse {
  amount: number;
  broker: Broker;
  brokerId: number;
  brokerName: string | null;
  creationAt: string;
  currency: string;
  customer: Customer;
  customerId: number;
  customerName: string | null;
  deletable: boolean | null;
  editable: boolean | null;
  emissionDate: string;
  endDate: string;
  externalId: string;
  id: number;
  initDate: string;
  installments: InstallmentBackend[];
  insuranceId: number;
  insuranceName: string | null;
  insurancePolicyPremium: InsurancePolicyPremium;
  name: string;
  policyNumber: string;
  premiumPayment: PremiumPayment;
  primeAmount: number | null;
  saleId: number;
  status: string;
  updatedAt: string;
}

export interface Installment {
  installmentNumber: number;
  installmentValue: number | string;
  dueDate?: string;
  status: "paid" | "pending" | "overdue" | string;
  brokerCommission?: number | string;
  paymentDate?: string;
}

export interface PolicyTableDetails {
  installmentNumber: number;
  installmentValue: string;
  dueDate: string;
  status: string;
  brokerCommission: string;
  paymentDate: string;
}
