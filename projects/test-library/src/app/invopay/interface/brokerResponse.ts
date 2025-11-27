export interface BrokersResponse extends Array<Broker> {}

export interface Broker {
  id: number;
  username: string;
  email: string;
  lastLoginDate: string;
  enterpriseId: number;
  supplierId: number;
  userType: string;
  role: Role;
  roleId: number;
  userStatus: string;
  position: string;
  numberId: string;
  countryId: number;
  userSubType: string;
  externalId: string;
  avatar: string;
  fullName: string;
  fullAddress: string;
  phoneNumber: string;
  fiscalId: string;
  isBrokerPromoter: boolean;
  userCreationDate: string;
  account: Account;
  userTypePerson: UserTypePerson;
  nationalId: string;
  businessName: string;
  economicActivity: string;
  secondaryPhoneNumber: string;
  extraData: string;
  address: Address;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  global: boolean;
  permissions: Permission[];
}

export interface Permission {
  name: string;
  description: string;
}

export interface Account {
  accountNumber: string;
  bank: string;
  branchNumber: string;
  ownerName: string;
  currency: string;
  accountType: string;
  extras: string;
  supplierId: number;
  userId: number;
}

export interface UserTypePerson {
  id: number;
  value: string;
  code: string;
}

export interface Address {
  id: number;
  city: string;
  country: string;
  zipCode: string;
  enterpriseId: number;
  fullAddress: string;
  region: string;
  departament: string;
}
