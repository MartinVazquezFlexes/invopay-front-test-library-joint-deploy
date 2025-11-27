export interface Broker {
  id: number;
  username: string;
}
export interface BrokerCategory {
  id: number;
  name: string;
  category?:string;
}
export interface Product {
  id: string;
  name: string;
}

export interface Policy {
  id: string;
  number: string;
}
export interface Instance {
  name: string;
  schemeType: string;
  ruleScope: string;
  hasIncentiveCategory: boolean;
  isActive: boolean;
  percentage: number;
  brokerCategory?: string;
  products?: Product[];
  brokers?: BrokerCategory[];
  policies?: Policy[];
}