//Scheme
export interface SchemeParameters {
  percentage: number;
}

export interface Scheme {
  id: number;
  name: string;
  description: string;
  longDescription: string | null;
  enterpriseId: number;
  externalId: string;
  isActive: boolean;
  parameters: SchemeParameters;
  schemaType: 'PERCENTAGE' | 'FIXED' | string; //ver tipos
}

//SchemeDetails
export interface SchemeDetails {
  id: number;
  externalId: string;
  name: string;
  description: string;
  parameters: string;
  schemaType: string;
  enterpriseId: number;
  isActive: boolean;
  longDescription: string;
}

