import { Injectable } from "@angular/core";
import { FindAllRevenueResponse, RevenueTableRow } from "../interface/revenues";

@Injectable({
    providedIn: 'root'
})
export class RevenuesMapper {
    constructor() { }

    mapToRevenueTableRows(revenues: FindAllRevenueResponse[]): RevenueTableRow[] {
        return revenues.map(this.toRevenueTableRow);
    }

    toRevenueTableRow(revenue: FindAllRevenueResponse): RevenueTableRow {
        return {
            id: revenue.id.toString(),
            revenueDate: new Date(revenue.revenueDate).toLocaleDateString(),
            currency: revenue.currency,
            revenueAmount: revenue.revenueAmount.toFixed(2),
            paymentProvider: revenue.paymentProvider,
            paymentChannel: revenue.paymentChannel,
            isConsolidated: revenue.isConsolidated ? 'Yes' : 'No',
            policyNumber: revenue.policyNumber,
            productName: revenue.productName,
            premiumAmount: revenue.premiumAmount.toFixed(2),
            brokerName: revenue.brokerName
        };
    }
}
