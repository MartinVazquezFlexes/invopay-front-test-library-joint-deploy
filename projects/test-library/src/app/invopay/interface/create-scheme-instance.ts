export interface SelectOption {
  label: string;
  value: any;
}

export interface Broker {
  id: number;
  username: string;
  email: string;
}

export interface Policy {
  id: number;
  policyNumber: string;
  brokerName: string;
  amount: number;
  brokerId: number;
}

export interface Product {
  id: number;
  name: string;
}