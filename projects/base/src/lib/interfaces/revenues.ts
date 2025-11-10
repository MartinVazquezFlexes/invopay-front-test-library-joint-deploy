export interface FindAllRevenueResponse {
    id: number;
    revenueDate: Date;
    currency: string;
    revenueAmount: number;
    paymentProvider: string;
    paymentChannel: string;
    isConsolidated: boolean;
    policyNumber: string;
    productName: string;
    premiumAmount: number;
    brokerName: string;
}

export interface RevenueTableRow {
    id: string;
    revenueDate: string;
    currency: string;
    revenueAmount: string;
    paymentProvider: string;
    paymentChannel: string;
    isConsolidated: string;
    policyNumber: string;
    productName: string;
    premiumAmount: string;
    brokerName: string;
}