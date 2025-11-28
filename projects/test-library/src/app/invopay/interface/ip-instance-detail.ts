export interface BrokerCategory {
  id: number;
  username: string;
  userEmail:string;
  userCreationDate:string;
  lastLoginDate:string;
}
export interface Product {
  id: string;
  name: string;
  description: string;
  externalId: string;
  type: string;
  insuranceEnterprise: string;
  isActive: boolean;
  enterpriseId: number;
  logoUrl: string;
  longDescription: string;
  code: string;
  logoFile:string;
  deletable:boolean;
  editable:boolean;
  documents:Documents[];
}

export interface Documents{
  id:number;
  fileName:string;
  filePath:string;
  url:string;
  insuranceProductId:number;
  enterpriseId:number;
}

export interface Policy {
  id: string;
  number: string;
}
export interface Instance {
  name: string;
  commissionSchemeId: number;
  byBroker: boolean;
  byProduct: boolean;
  hasIncentiveScheme: boolean;
  createdByUserId: number;
  createdDate: string;
  lastUpdate: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  enterpriseId:number;
  deletable:boolean;
  editable:true;
  schemaType:string;
  scope:string;
  commissionPercentage:number;
  commissionFixedAmount:number;
  brokers:BrokerCategory[];
  products:Product[];
  insurancePolicies:InsurancePolicies[];
  incentiveCategories:IncentiveCategory[];
  hasIncentiveCategory:boolean;
}

export interface InsurancePolicies{
      id: number;
      name: string;
      policyNumber: string;
      externalId: string;
      emissionDate: string;
      initDate: string;
      endDate: string;
      amount: number;
      currency: string;
      status: string;
      creationAt: string;
      updatedAt: string;
      insuranceId: number;
      insuranceName: string;
      customerId: number;
      customerName: string;
      brokerId: number;
      brokerName: string;
      saleId: number;
      deletable: boolean;
      editable: boolean;
      primeAmount: number;
}

export interface BrokerProduct {
  id: string;
  commissionSchemeInstanceId: number;
  commissionSchemeInstanceName: string;
  brokerId: number;
  brokerName: string;
  brokerEmail:string;
  productId: number;
  productType: string;
  creationTime: string;
  lastUpdate:string;
  isActive:boolean;
  enterpriseId:number;
  deletable:boolean;
  editable:boolean;
}

export interface IncentiveCategory{
   id: number;
   name: string;
   creationTime: string;
   lastUpdate: string;
   isActive: boolean;
   enterpriseId: number;
   deletable: boolean;
   editable: boolean;
   code: string;
}