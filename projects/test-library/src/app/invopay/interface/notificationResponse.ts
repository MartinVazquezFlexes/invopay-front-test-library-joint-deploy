export interface Observation {
  id: number;
  description: string;
  creationDate: string;
  typeDomain: string;
  domainId: number;
  userProvider: number;
  userInvopayId: number;
  username: string;
}

export interface Notification {
  id: number;
  observation: Observation;
  isRead: boolean;
  type: string;
  readDate: string;
  readUserName: string;
}
export interface NotificationRead {
  notificationId: number;
  reply?: string;
}