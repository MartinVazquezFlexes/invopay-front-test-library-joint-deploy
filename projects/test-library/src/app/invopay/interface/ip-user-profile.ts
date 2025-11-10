import { UserStatus } from "../types/ip-user-status";
import { UserType } from "../types/ip-user-type";

export default interface IpUserProfile {
  id: number;
  username: string;
  email: string;
  // These shouldn't be here
  userStatus?: UserStatus;
  userType?: UserType;
  //
  bussinessName: string;
  countryId: number;
  supplierId?: number;
  enterpriseId?: number;
  fullName: string;
  phoneNumber: string;
}
