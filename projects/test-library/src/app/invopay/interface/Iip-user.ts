import { UserType } from "../types/ip-user-type";
import { RoleResponse } from "./ip-role-response";

export interface User {
  id: number;
  username: string;
  email: string;
  userType: UserType;
  enterpriseId: number;
  supplierId: number;
  access_token: string;
  refresh_token: string;
  supplierSignInReponse: any;
  roleResponse?: RoleResponse;
}
