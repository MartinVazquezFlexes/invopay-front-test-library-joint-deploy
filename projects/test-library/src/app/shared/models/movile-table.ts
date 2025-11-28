export interface CardField {
  label: string;
  key: string;
  highlight?: boolean;
  isAmount?: boolean;
  isStatus?: boolean;
  isAmountBold?: boolean;
}

export interface CardConfig {
  headerKey: string;
  headerLabel?: string;
  fields: CardField[];
  showActionButton?: boolean;
  actionIcon?: 'eye' | 'edit' | 'delete';
  actions?: string[];
}