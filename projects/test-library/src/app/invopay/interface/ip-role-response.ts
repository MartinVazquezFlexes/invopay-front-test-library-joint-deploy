import { IpPermissionResponse } from "./ip-permission-response";

export interface RoleResponse {
  id: number;
  name: string;
  description: string;
  global: boolean;
  permissions?: IpPermissionResponse[];
}
