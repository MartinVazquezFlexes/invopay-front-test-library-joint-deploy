import { Observation } from './notificationResponse';

export interface NotificationItem {
  id: number;
  notificationDate: string;
  entity: string;
  brokerName: string;
  query: string;
  answered: string;
  _rawData: {
    id: number;
    notificationDate: string;
    entity: string;
    brokerName: string;
    query: string;
    answered: boolean;
    observation: Observation;
  };
  responses?: {
    date: string;
    text: string;
    respondedBy?: string;
  }[];
}

export interface NotificationTrayConfig {
  title: string;
  columns: string[];
  actions: string[];
  tableStyle: string;
  entities: string[];
  users: string[];
  translations: {
    table: {
      date: string;
      entity: string;
      broker: string;
      query: string;
      answered?: string;
    };
    filters: {
      answered: string;
      entity: string;
      user: string;
      answeredPlaceholder: string;
      entityPlaceholder: string;
      userPlaceholder: string;
      yes: string;
      no: string;
    };
  };
}
