import { Component, Input } from '@angular/core';
import { TableService } from '../../../invopay/types/ip-table-service';


@Component({
  selector: 'app-no-data',
  templateUrl: './no-data.component.html',
  styleUrls: ['./no-data.component.scss'],
})
export class NoDataComponent {
  @Input() service: TableService | null = null;

  setText(service: TableService): string {
    switch (service) {
      case 'invoice':
        return 'IP.TABLE.NOT-FOUND.INVOICE';
      case 'surrenders':
        return 'IP.TABLE.NOT-FOUND.SURRENDER';
      case 'purchase-order':
        return 'IP.TABLE.NOT-FOUND.PURCHASE-ORDER';
      case 'invoice-paid':
      case 'surrenders-paid':
        return 'IP.TABLE.NOT-FOUND.PAYMENT-HISTORY';
      case 'invoice-report':
        return 'IP.TABLE.NOT-FOUND.REPORT-INVOICE';
      case 'surrenders-report':
        return 'IP.TABLE.NOT-FOUND.REPORT-SURRENDER';
      case 'active-contracts':
        return 'IP.TABLE.NOT-FOUND.ACTIVE-CONTRACT';
      case 'subsidiaries':
        return 'IP.TABLE.NOT-FOUND.SUBSIDIARIES';
      case 'supplier':
        return 'IP.TABLE.NOT-FOUND.SUPPLIER';
      case 'user-management':
      case 'supplier-users':
        return 'IP.TABLE.NOT-FOUND.USERS';
      case 'admin-management':
        return 'IP.TABLE.NOT-FOUND.ADMINS';
      case 'employee-management':
        return 'IP.TABLE.NOT-FOUND.EMPLOYEES';
      case 'settlements':
        return 'IP.TABLE.NOT-FOUND.SETTLEMENTS';
      case 'sales':
        return 'IP.TABLE.NOT-FOUND.SALES';
      case 'account-transactions':
        return 'IP.TABLE.NOT-FOUND.ACCOUNT-TRANSACTIONS';
      case 'card-transactions':
        return 'IP.TABLE.NOT-FOUND.CARD-TRANSACTIONS';
      case 'supplier-accounts':
        return 'IP.TABLE.NOT-FOUND.SUPPLIER-ACCOUNTS';
      case 'errors':
        return 'IP.TABLE.NOT-FOUND.ERRORS';
      case 'history':
        return 'IP.TABLE.NOT-FOUND.HISTORY';
      default:
        return '';
    }
  }
}
