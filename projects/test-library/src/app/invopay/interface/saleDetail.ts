import { PolicyData } from "./policyData";

export interface saleDetail {
  id: number;
  amount: number;
  saleDate: string;
  currency: string;
  customer: Customer;
  brokerId: number;
  brokerName: string;
  brokerNameBussiness: string;
  productId: string;
  productName: string;
  premiumPaymentInstallments: number;
  policyData: PolicyData;
}

export interface Customer {
  externalId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  fullName: string;
}

