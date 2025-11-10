import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TransformDataTablePipe } from '../../Utils/transform-data-table.pipe';
import { ActionActive, TableEvent } from '../table/Itable';

import { CustomDatePipe } from '../../Utils/pipeCustomDate';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { TableService } from '../../../invopay/types/ip-table-service';


// COMO UTILIZAR:
// agregar el service y los datos a mostrar en 'serviceLabelsMap'
// 'getTypeService' debe devolver algun servicio
// detro de 'setLabels' se pueden cambiar los datos de ser necesario y se debe definir el translate, el keyOrder y setear el infoArray
// si tiene acciones, el infoarray debe tener un id (o similar)

@Component({
  selector: 'app-card-table',
  templateUrl: './card-table.component.html',
  styleUrls: ['./card-table.component.scss'],
  providers: [CustomDatePipe],
})
export class CardTableComponent implements OnInit, OnChanges {
  keyColumns: string[] = [];
  tableHeads: any;
  data!: any;
  @Input() set dataCard(data: any) {
    if (data) {
      this.data = data;
      this.keyColumns = [];
      this.states = [];
      this.setTableHeads();
      this.setInfoCard();
    }
  }
  @Input() service!: TableService;
  @Input() actions?: string[] = [];
  @Input() keyTranslate!: string;
  @Output() action: EventEmitter<TableEvent> = new EventEmitter<TableEvent>();
  @Input() actionsIf: ActionActive[] = [];

  primaryInfo: string[] = [];
  secondaryInfo: Array<string[]> = [];
  datesInfo: string[] = [];
  states: string[] = [];
  currentMenuIndex: number | null = null;
  selectedInvoicesList: any = [];
  typeService!: 'invoice' | 'surrenders' | 'supplier' | 'project' | 'settlements' | 'sales' | 'configuration' | 'costCenter' | 'employee' | 'subsidiaries' | 'pay-in' | 'consolidated' | 'consolidated-template';
  @Output() invoicesSelected = new EventEmitter<any[]>();
  @Output() selectedItemsChange = new EventEmitter<any>();
  @Output() selectedSales = new EventEmitter<{ev: MatCheckboxChange, selectSale:any}>();
  @Output() saleCheckedEvent = new EventEmitter<any>();
  @Input() isForSelectItem?: boolean;

  labelsArray: any = [];
  labelsArrayTest: {id: string, data: any}[] = [];
  serviceLabelsMap: { [key in TableService]: string[] } = {
    invoice: [
      'dueDate',
      'creationDate',
      'loadingDate',
      'supplierName',
      'fiscalId',
      'typeStatus',
      'totalAmount',
    ], // Ejemplo de etiquetas para 'invoice'
    'invoice-paid': ['creationDate', 'dueDate', 'supplierName'],
    'invoice-report': [],
    'invoice-supplier': [],
    // Agrega más servicios y sus correspondientes campos aquí
    settlements: [
      'settlementId',
      'creationTime', 
      'startDateSettlement',
      'endDateSettlement',
      'providerName',
      'status',
      'settlementSummary'
    ], 
    'billed-settlements': [],
    // Continúa para otros tipos de servicio...
    'supplier-users': [],
    subsidiaries: [
      'bussinesId',
      'businessName',
      'country',
      'contactNumber', 
      'addresses'
    ],
    'user-management': [
      'numberId',
      'username',
      'email',
      'role',
      'userCreationDate',
      'userStatus'
    ],
    'admin-management': [
      'numberId',
      'username',
      'email',
      'enterprise',
      'userCreationDate',
      'userStatus'
    ],
    'employee-management': [
      'numberId',
      'username',
      'email',
      'position',
      'userCreationDate',
      'userStatus'
    ],
    supplier: [
      'businessName',
      'id',
      'userCreationDate',
      'username',
      'userEmail',
      'lastLoginDate',
      'state'
    ],
    sales:[
      'billId',
      'brokerNameBussiness',
      'commissionAmount',
      'productName',
      'saleAmount',
      'expenses',
      'saleDate',
      'saleId',
      'idSettlement',
      'isPaid'
    ],
    "sales-settlement":[],
    'settlements-details':[],
    'settlements-from-sale': [],
    'supplier-broker': [],
    'surrenders-paid': [],
    surrenders: [
      'id',
      'username',
      'concept',
      'creationDate',
      'typeStatus',
      'amount'
    ],
    'surrenders-report': [],
    'purchase-order': [
      'purchaseId',
      'costCenterName',
      'supplierName',
      'name',
      'startDate',
      'finishDate',
      'isActive',
    ],
    'active-contracts': [
      'contractId',
      'costCenterName',
      'supplierName',
      'name',
      'startDate',
      'finishDate',
      'isActive',
    ],
    'payments-done': [
      'provider_name',
      'idConsolidate',
      'date',
      'accNumber',
      'amount',
      'cuit',
    ],
    'payments-ongoing': [
      'provider_name',
      'idConsolidate',
      'date',
      'accNumber',
      'amount',
      'cuit',
      'invoicesCount',
    ],
    'account-transactions': [
      'dateTime',
      'movementType',
      'description',
      'amount',
    ],
    'selected-invoice': [],
    'invoice-to-pay': [
      'id',
      'select_all',
      'provider_name',
      'charge_date',
      'emit_date',
      'amount',
    ],
    'consolidated': [      
      'id_consolidated',
      'consolidated_name',
      'datetime_generated',
      'total_providers',
      'total_invoices',
      'total_amount',
    ],
    'consolidated-pay-in': ['idDB','transactionId', 'date', 'paymentType','amount', 'isConciliate'],
    'consolidated-detail': [],
    'consolidated-template': [
      'owner_name',
      'accnumber',
      'bank',
      'branch_number',
      'invoices_total',
      'amount',
    ],
    'card-transactions': ['dateTime', 'movementType', 'description', 'amount'],
    'supplier-accounts': [
      'businessName',
      'userName',
      'cardNumber',
      'formattedCardBalance',
      'accountNumber',
      'formattedAccountBalance',
      'cardNetwork',
      'cardStatus',
      'supplierId',
    ],
    'flowstatus': [
      'description',
      'global',
      'isInitial',
      'isPaid',
      'isPayable',
      'isRejected',
      'roles',
      'status',
    ],
    'roles': [
      'description',
      'global',
      'name',
    ],
    'transitions':[
      'currentStatus',
      'description',
      'nextStatus'
    ],
    'cost-center': [
      'name',
      'description'
    ],
    'rendition-type': [
      'name',
      'description'
    ],
    'errors':[],
    'history':[],
    'brokers': [],
    'metrics-settlements-dashboard': [],
    'metrics-invoices-dashboard': [],
  };

  constructor(
    private translate: TranslateService,
    private transform: TransformDataTablePipe,
    private customDate: CustomDatePipe
  ) {}
  ngOnInit(): void {
    this.typeService = this.getTypeService();
    this.setLabels();
  }

  getTypeService(): 'invoice' | 'surrenders' | 'supplier' | 'project' | 'settlements' | 'sales' | 'configuration' | 'costCenter' | 'employee' | 'subsidiaries' | 'pay-in' | 'consolidated' | 'consolidated-template' {
    switch (this.service) {
      case 'invoice':
      case 'invoice-paid':
      case 'invoice-report':
      case 'invoice-to-pay':
        return 'invoice';
      case 'surrenders':
      case 'surrenders-report':
      case 'surrenders-paid':
        return 'surrenders';
      case 'supplier':
      case 'supplier-broker':
      case 'brokers':
        return 'supplier';
      case 'active-contracts':
      case 'purchase-order':
        return 'project';
      case 'settlements':
        return 'settlements';
      case 'sales':
      case 'settlements-details':
      case 'settlements-from-sale':
      case 'sales-settlement':
        return 'sales';
      case 'flowstatus':
      case 'roles':
      case 'transitions':
        return 'configuration';
      case 'cost-center':
      case 'rendition-type':
        return 'costCenter';
      case 'user-management':
      case 'admin-management':
      case 'employee-management':
        return 'employee'
      case 'subsidiaries':
        return 'subsidiaries'
      case 'consolidated-pay-in':
        return 'pay-in'
      case 'consolidated':
        return 'consolidated'
      case 'consolidated-template':
        return 'consolidated-template'
      default:
        throw new Error('Unexpected service type.');
    }
  }

  private setTableHeads(): any {
    let singleData = this.data[0];
    let heads: any = {};
    for (const key in singleData) {
      const translate = this.getTranslate(key);
      if (translate) {
        this.keyColumns.push(key);
        heads[key] = translate;
      }
    }

    this.tableHeads = heads;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dataCard']) {
      const currentValue = changes['dataCard'].currentValue;
      const previousValue = changes['dataCard'].previousValue;
      if (currentValue !== previousValue) {
        this.setLabels();
      }
    }
  }

  isStatusKey(key: string): boolean {
    return (key === this.translate.instant('IP.INVOICES.CARD.TYPESTATUS')
    || key === this.translate.instant('IP.CARD_TABLE.INVOICE.TYPESTATUS')
    || key === this.translate.instant('IP.CARD_TABLE.ACTIVE-CONTRACTS.ISACTIVE')
    || key === this.translate.instant('IP.CARD_TABLE.PURCHASE-ORDER.ISACTIVE')
    || key === this.translate.instant('IP.CARD_TABLE.SUPPLIER.STATE')
    || key === this.translate.instant('IP.CARD_TABLE.SETTLEMENTS.STATUS')
    || key === this.translate.instant('IP.CARD_TABLE.SALES.ISPAID')
    || key === this.translate.instant('IP.CARD_TABLE.EMPLOYEE.USERSTATUS')) && this.typeService != 'configuration'
  }

  setStatusValue(value: any){
    if(value?.status) return value.status
    if(value?.statusText) return value.statusText
    if(this.typeService === 'sales') return value == true ? 'Pagada' : 'No pagada'
    return value == true ? 'Activo' : 'Desactivo'
  }

  separatorKey(data: any[]){
    return data.some((item: any) => item.key === this.translate.instant('IP.INVOICES.CARD.TYPESTATUS') || item.key === this.translate.instant('IP.CARD_TABLE.INVOICE.TYPESTATUS'));
  }

  isIdKey(key: string): boolean {
    return key === this.translate.instant('IP.INVOICES.CARD.FISCALID')
     || key === this.translate.instant('IP.CARD_TABLE.INVOICE.FISCALID')
     || key === this.translate.instant('IP.CARD_TABLE.SURRENDERS.ID')
     || key === this.translate.instant('IP.CARD_TABLE.SUPPLIER.ID')
     || key === this.translate.instant('IP.CARD_TABLE.ACTIVE-CONTRACTS.CONTRACTID')
     || key === this.translate.instant('IP.CARD_TABLE.PURCHASE-ORDER.PURCHASEID')
     || key === this.translate.instant('IP.CARD_TABLE.SETTLEMENTS.SETTLEMENTID')
     || key === this.translate.instant('IP.CARD_TABLE.SALES.SALEID')
     || key === this.translate.instant('IP.CARD_TABLE.EMPLOYEE.NUMBERID')
     || key === this.translate.instant('IP.CARD_TABLE.SUBSIDIARIES.BUSSINESID')
     || key === this.translate.instant('IP.CARD_TABLE.PAY-IN.TRANSACTIONID')
  }

  toggleMenu(index: number): void {
    this.currentMenuIndex = this.currentMenuIndex === index ? null : index;
  }

  isMenuOpen(index: number): boolean {
    return this.currentMenuIndex === index;
  }

  isUsernameKey(key: string): boolean {
    return key === this.translate.instant('IP.INVOICES.CARD.SUPPLIERNAME') 
      || key === this.translate.instant('IP.CARD_TABLE.INVOICE.SUPPLIERNAME') 
      || key === this.translate.instant('IP.CARD_TABLE.SURRENDERS.USERNAME')
      || key === this.translate.instant('IP.CARD_TABLE.SUPPLIER.BUSINESSNAME')
      || key === this.translate.instant('IP.CARD_TABLE.ACTIVE-CONTRACTS.SUPPLIERNAME')
      || key === this.translate.instant('IP.CARD_TABLE.PURCHASE-ORDER.SUPPLIERNAME')
      || key === this.translate.instant('IP.CARD_TABLE.SETTLEMENTS.PROVIDERNAME')
      || key === this.translate.instant('IP.CARD_TABLE.SALES.BROKERNAMEBUSSINESS')
      || key === this.translate.instant('IP.CARD_TABLE.EMPLOYEE.USERNAME')
      || key === this.translate.instant('IP.CARD_TABLE.SUBSIDIARIES.BUSINESSNAME')
      || key === this.translate.instant('IP.TABLE.INVOICE-TO-PAY.CARD.PROVIDER_NAME')
      || key === this.translate.instant('IP.CARD_TABLE.CONSOLIDATED.CONSOLIDATED_NAME') 
  }
  selectAllChecked = false;
  selectedItems: Set<any> = new Set();

  toggleSelectAllInvoices() {
    this.selectAllChecked = !this.selectAllChecked;
    if (this.selectAllChecked) {
      this.data.forEach((item: any) => this.selectedItems.add(item));
      this.selectedItemsChange.emit(Array.from(this.selectedItems));
    } else {
      this.selectedItems.clear();
    }
  }

  isItemSelected(item: any): boolean {
    return this.selectedItems.has(item);
  }

  toggleItemSelection(item: any) {
    if (this.selectedItems.has(item)) {
      this.selectedItems.delete(item);
      let dataSelected:any[] = []
      this.selectedItems.forEach(s=>dataSelected.push(this.getDataField(s.id)))
      
      this.selectedItemsChange.emit(Array.from(dataSelected));
    } else {
      this.selectedItems.add(item);
      let dataSelected:any[] = []
      this.selectedItems.forEach(s=>dataSelected.push(this.getDataField(s.id)))

      this.selectedItemsChange.emit(Array.from(dataSelected));
    }
  }
  
  onInvoiceSelectionChange(newSelection: any) {
    this.selectedInvoicesList = newSelection;

    // Emitimos la lista actualizada al componente padre
    this.invoicesSelected.emit(this.selectedInvoicesList);
  }

  isDateKey(key: string): boolean {
    return (
      key === this.translate.instant('IP.INVOICES.CARD.CREATIONDATE') ||
      key === this.translate.instant('IP.INVOICES.CARD.LOADINGDATE') ||
      key === this.translate.instant('IP.CARD_TABLE.INVOICE.CREATIONDATE') ||
      key === this.translate.instant('IP.CARD_TABLE.INVOICE.LOADINGDATE') ||
      key === this.translate.instant('IP.TABLE.PAYMENTS-DONE.CARD.DATE') ||
      key === this.translate.instant('IP.CARD_TABLE.SURRENDERS.CREATIONDATE') ||
      key === this.translate.instant('IP.CARD_TABLE.SUPPLIER.USERCREATIONDATE') ||
      key === this.translate.instant('IP.CARD_TABLE.SUPPLIER.LASTLOGINDATE') || 
      key === this.translate.instant('IP.CARD_TABLE.ACTIVE-CONTRACTS.STARTDATE') ||
      key === this.translate.instant('IP.CARD_TABLE.ACTIVE-CONTRACTS.FINISHDATE') ||
      key === this.translate.instant('IP.CARD_TABLE.PURCHASE-ORDER.STARTDATE') ||
      key === this.translate.instant('IP.CARD_TABLE.PURCHASE-ORDER.FINISHDATE') ||
      key === this.translate.instant('IP.CARD_TABLE.SETTLEMENTS.CREATIONTIME') ||
      key === this.translate.instant('IP.CARD_TABLE.SETTLEMENTS.STARTDATESETTLEMENT') ||
      key === this.translate.instant('IP.CARD_TABLE.SETTLEMENTS.ENDDATESETTLEMENT') ||
      key === this.translate.instant('IP.CARD_TABLE.SALES.SALEDATE') ||
      key === this.translate.instant('IP.CARD_TABLE.EMPLOYEE.USERCREATIONDATE') ||
      key === this.translate.instant('IP.CARD_TABLE.PAY-IN.DATE') ||
      key === this.translate.instant('IP.CARD_TABLE.CONSOLIDATED.DATETIME_GENERATED') ||
      key === this.translate.instant('IP.TABLE.INVOICE-TO-PAY.CARD.CHARGE_DATE')
    );
  }

  isValueKey(key: string): boolean {
    return (
      key === this.translate.instant('IP.CARD_TABLE.SURRENDERS.CONCEPT') ||
      key === this.translate.instant('IP.CARD_TABLE.SUPPLIER.USEREMAIL') ||
      key === this.translate.instant('IP.CARD_TABLE.SUPPLIER.USERNAME') ||
      key === this.translate.instant('IP.CARD_TABLE.ACTIVE-CONTRACTS.NAME') || 
      key === this.translate.instant('IP.CARD_TABLE.ACTIVE-CONTRACTS.COSTCENTERNAME') ||
      key === this.translate.instant('IP.CARD_TABLE.PURCHASE-ORDER.NAME') || 
      key === this.translate.instant('IP.CARD_TABLE.PURCHASE-ORDER.COSTCENTERNAME') ||
      key === this.translate.instant('IP.CARD_TABLE.SALES.IDSETTLEMENT') ||
      key === this.translate.instant('IP.CARD_TABLE.SALES.BILLID') ||
      key === this.translate.instant('IP.CARD_TABLE.SALES.PRODUCTNAME') ||
      key === this.translate.instant('IP.CARD_TABLE.SALES.CUSTOMERID') ||
      key === this.translate.instant('IP.CARD_TABLE.SALES.COMMISSIONPERCENTAGE') ||
      key === this.translate.instant('IP.CARD_TABLE.FLOWSTATUS.GLOBAL') ||
      key === this.translate.instant('IP.CARD_TABLE.FLOWSTATUS.STATUS') ||
      key === this.translate.instant('IP.CARD_TABLE.ROLES.DESCRIPTION') ||
      key === this.translate.instant('IP.CARD_TABLE.ROLES.NAME') ||
      key === this.translate.instant('IP.CARD_TABLE.TRANSITIONS.DESCRIPTION') ||
      key === this.translate.instant('IP.CARD_TABLE.TRANSITIONS.CURRENTSTATUS') ||
      key === this.translate.instant('IP.CARD_TABLE.TRANSITIONS.NEXTSTATUS') ||
      key === this.translate.instant('IP.CARD_TABLE.COSTCENTER.NAME') ||
      key === this.translate.instant('IP.CARD_TABLE.COSTCENTER.DESCRIPTION') ||
      key === this.translate.instant('IP.CARD_TABLE.EMPLOYEE.EMAIL') ||
      key === this.translate.instant('IP.CARD_TABLE.EMPLOYEE.POSITION') ||
      key === this.translate.instant('IP.CARD_TABLE.EMPLOYEE.ENTERPRISE') ||
      key === this.translate.instant('IP.CARD_TABLE.EMPLOYEE.ROLE') ||
      key === this.translate.instant('IP.CARD_TABLE.SUBSIDIARIES.COUNTRY') ||
      key === this.translate.instant('IP.CARD_TABLE.SUBSIDIARIES.ADDRESSES') ||
      key === this.translate.instant('IP.CARD_TABLE.SUBSIDIARIES.CONTACTNUMBER') ||
      key === this.translate.instant('IP.CARD_TABLE.CONSOLIDATED.TOTAL_PROVIDERS') ||
      key === this.translate.instant('IP.CARD_TABLE.CONSOLIDATED.TOTAL_INVOICES') ||
      key === this.translate.instant('IP.PAYMENTS.DETAILS.OWNER_NAME') ||
      key === this.translate.instant('IP.PAYMENTS.DETAILS.ACCNUMBER') ||
      key === this.translate.instant('IP.PAYMENTS.DETAILS.BANK') ||
      key === this.translate.instant('IP.PAYMENTS.DETAILS.BRANCH_NUMBER') ||
      key === this.translate.instant('IP.PAYMENTS.DETAILS.INVOICES_TOTAL') 
    );
  }

  isValueKeyFlowStatus(key: string, value: boolean){
    return(
      (key === this.translate.instant('IP.CARD_TABLE.FLOWSTATUS.ISINITIAL') ||
      key === this.translate.instant('IP.CARD_TABLE.FLOWSTATUS.ISPAID') ||
      key === this.translate.instant('IP.CARD_TABLE.FLOWSTATUS.ISPAYABLE') ||
      key === this.translate.instant('IP.CARD_TABLE.FLOWSTATUS.ISREJECTED')) && value
    )
  }

  isValueKeyRoles(key: string){
    return(
      key === this.translate.instant('IP.CARD_TABLE.FLOWSTATUS.ROLES')
    )
  }

  setValueKey(value: any, key?: string){
    if(this.service === 'sales' && key === this.translate.instant('IP.CARD_TABLE.SALES.IDSETTLEMENT')) return value ? this.translate.instant('IP.CARD_TABLE.SALES.YES') : this.translate.instant('IP.CARD_TABLE.SALES.NO')
    if(['flowstatus', 'roles'].includes(this.service) && key === this.translate.instant('IP.CARD_TABLE.FLOWSTATUS.GLOBAL')) return value ? this.translate.instant('IP.FLOW_STATUS.MANAGEMENT.GLOBAL') : this.translate.instant('IP.FLOW_STATUS.MANAGEMENT.LOCAL')
    if(this.service === 'sales-settlement' && key === this.translate.instant('IP.CARD_TABLE.SALES.COMMISSIONPERCENTAGE')) return value+'%'
    if(this.service === 'subsidiaries' && key === this.translate.instant('IP.CARD_TABLE.SUBSIDIARIES.COUNTRY')) return value.name
    if(this.service === 'subsidiaries' && key === this.translate.instant('IP.CARD_TABLE.SUBSIDIARIES.ADDRESSES')) return value[0].fullAddress
    return value ? value : '-'
  }

  setValueKeyFlowStatus(value: any, key?: string){

  }

  isDateTimeKey(key: string): boolean {
    return (
      key ===
      this.translate.instant('IP.TABLE.ACCOUNT-TRANSACTIONS.CARD.DATETIME')
    );
  }

  isMovementTypeKey(key: string): boolean {
    return (
      key ===
      this.translate.instant('IP.TABLE.ACCOUNT-TRANSACTIONS.CARD.MOVEMENTTYPE')
    );
  }

  getMovementType(data: string) {
    if (data === 'Credito') {
      return this.translate.instant('IP.FINANCES.MOVEMENT_TYPES.CREDIT');
    }
    if (data === 'Debit') {
      return this.translate.instant('IP.FINANCES.MOVEMENT_TYPES.DEBIT');
    }
  }

  isAmountKey(key: string): boolean {
    return (
      key === this.translate.instant('IP.INVOICES.CARD.TOTALAMOUNT') ||
      key === this.translate.instant('IP.TABLE.ACCOUNT-TRANSACTIONS.AMOUNT') ||
      key === this.translate.instant('IP.TABLE.PAYMENTS-DONE.CARD.AMOUNT') ||
      key === this.translate.instant('IP.CARD_TABLE.INVOICE.TOTALAMOUNT') ||
      key === this.translate.instant('IP.CARD_TABLE.SETTLEMENTS.SETTLEMENTSUMMARY') ||
      key === this.translate.instant('IP.CARD_TABLE.SALES.COMMISSIONAMOUNT') ||
      key === this.translate.instant('IP.CARD_TABLE.SALES.EXPENSES') ||
      key === this.translate.instant('IP.CARD_TABLE.SALES.SALEAMOUNT') ||
      key === this.translate.instant('IP.TABLE.SUPPLIER-ACCOUNTS.CARD.FORMATTEDACCOUNTBALANCE') ||
      key === this.translate.instant('IP.TABLE.SUPPLIER-ACCOUNTS.CARD.FORMATTEDCARDBALANCE') ||
      key === this.translate.instant('IP.CARD_TABLE.CONSOLIDATED.TOTAL_AMOUNT') ||
      key === this.translate.instant('IP.CARD_TABLE.PAY-IN.AMOUNT')
    );
  }
  
  isBooleanKey(key: string): boolean {
    return (
      key === this.translate.instant('IP.CARD_TABLE.PAY-IN.CONCILIATE')
    );
  }
  
  isPaymentTypeKey(key: string): boolean {
    return (
      key === this.translate.instant('IP.CARD_TABLE.PAY-IN.PAYMENTTYPE')
    );
  }

  setValueAmountKey(val: any){
    if(val.settlementCommissionAmount) return val.settlementCommissionAmount;
    return val
  }
  
  setPaymentType(val: any){
    return val ===  'TRANSFER' ? this.translate.instant('IP.PAY_IN.METHOD.TRANSFER')
        : val ===  'TICKET' ? this.translate.instant('IP.PAY_IN.METHOD.TICKET')
        : val ===  'CASH' ? this.translate.instant('IP.PAY_IN.METHOD.CASH')
        : val ===  'CHECK' ? this.translate.instant('IP.PAY_IN.METHOD.CHECK')
        : '-';
  }

  isCardRelatedKey(key: string): boolean {
    return (
      this.isCardNumberKey(key) ||
      this.isCardNetworkKey(key) ||
      this.isCardStatusKey(key)
    );
  }

  isCardNumberKey(key: string): boolean {
    return (
      key ===
      this.translate.instant('IP.TABLE.SUPPLIER-ACCOUNTS.CARD.CARDNUMBER')
    );
  }

  isCardNetworkKey(key: string): boolean {
    return (
      key ===
      this.translate.instant('IP.TABLE.SUPPLIER-ACCOUNTS.CARD.CARDNETWORK')
    );
  }

  isCardStatusKey(key: string): boolean {
    return (
      key ===
      this.translate.instant('IP.TABLE.SUPPLIER-ACCOUNTS.CARD.CARDSTATUS')
    );
  }

  getCardNetworkKey(): string {
    return this.translate.instant(
      'IP.TABLE.SUPPLIER-ACCOUNTS.CARD.CARDNETWORK'
    );
  }

  getCardStatusKey(): string {
    return this.translate.instant('IP.TABLE.SUPPLIER-ACCOUNTS.CARD.CARDSTATUS');
  }

  getCardBrand(
    fields: Array<{
      key: string;
      value: string;
    }>
  ) {
    let cardBrand: string = '';
    fields.forEach((field) => {
      if (field.key === this.getCardNetworkKey()) {
        cardBrand = field.value;
      }
    });
    return cardBrand;
  }

  getCardStatus(
    fields: Array<{
      key: string;
      value: string;
    }>
  ) {
    let cardStatus: string = '';
    fields.forEach((field) => {
      if (field.key === this.getCardStatusKey()) {
        cardStatus = field.value;
      }
    });
    return cardStatus;
  }

  isExpirationDateKey(key: string): boolean {
    return key === this.translate.instant('IP.INVOICES.CARD.DUEDATE') ||
    key === this.translate.instant('IP.CARD_TABLE.INVOICE.DUEDATE');
  }

  setLabels() {
    this.labelsArrayTest = [];
    const currentService: TableService = this.service;

    const labelsForService = this.serviceLabelsMap[currentService] || [];

    if (this.service === 'consolidated') {
      this.data = this.data.map((item: any) => {        
        return {
          id: item.id_consolidated,
          ...item
        };
      });
    }

    if (this.service === 'consolidated-pay-in') {
      this.data = this.data.map((item: any) => {        
        return {
          idDB: item.id,
          transactionId: item.transactionId,
          paymentType: item.paymentType,
          date: item.date,
          amount: item.amount,
          ...item
        };
      });
    }

    if (this.service === 'payments-done') {
      this.data = this.data.map((item: any) => {
        return {
          id: item.id,
          provider_name: item.provider_name,
          idConsolidate: item.idConsolidate,
          date: item.date,
          accNumber: item.accNumber,
          amount: item.amount,
          ...item,
        };
      });
    }

    if (this.service === 'card-transactions') {
      this.data = this.data.map((item: any) => {
        return {
          dateTime: item.dateTime,
          movementType: item.movementType,
          description: item.description,
          amount: item.amount,
        };
      });
    }

    if (this.service === 'account-transactions') {
      this.data = this.data.map((item: any) => {
        return {
          dateTime: item.dateTime,
          movementType: item.movementType,
          description: item.description,
          amount: item.amount,
        };
      });
    }

    if (this.service === 'payments-ongoing') {
      this.data = this.data.map((item: any) => {
        return {
          provider_name: item.provider_name,
          date: item.date,
          idConsolidate: item.idConsolidate,
          accNumber: item.accNumber,
          invoicesCount: item.invoicesCount,
          amount: item.amount,
          ...item,
        };
      });
    }

    if (this.service === 'invoice-to-pay') {
      this.data = this.data.map((item: any) => {
        return {
          id: item.invoiceId,
          select_all: item.select_all,
          provider_name: item.provider_name,
          charge_date: item.charge_date,
          emit_date: item.emit_date,
          amount: item.amount,
          ...item
        };
      });
    }

    if (this.service === 'supplier-accounts') {
      this.data = this.data.map((item: any) => {
        return {
          businessName: item.businessName,
          userName: item.userName,
          cardNumber: item.cardNumber,
          formattedCardBalance: item.formattedCardBalance,
          accountNumber: item.accountNumber,
          formattedAccountBalance: item.formattedAccountBalance,
          ...item,
        };
      });
    }

    for (const key of Object.keys(this.data)) {
      const value = this.data[key];

      if (typeof value === 'object' && value !== null) {
        let infoArray: any = []; // Array para almacenar pares clave-valor de la factura
        
        let invoiceArray: any = [];
        
        for (const subKey of Object.keys(value)) {
          //Switch case para currentService;
          if (this.typeService === 'consolidated-template' && this.serviceLabelsMap['consolidated-template'].includes(subKey)) {
            this.translate
              .get(
                'IP.' +
                'PAYMENTS.DETAILS.' +
                  subKey.toUpperCase()
              )
              .subscribe((translation: string) => {
                infoArray.push({
                  key: translation,
                  value: value[subKey],
                });
              });              
          }

          if (this.typeService === 'consolidated' && this.serviceLabelsMap.consolidated.includes(subKey)) {
            this.translate
              .get(
                'IP.' +
                'CARD_TABLE.' +
                  this.typeService.toUpperCase() + "." +
                  subKey.toUpperCase()
              )
              .subscribe((translation: string) => {
                infoArray.push({
                  key: translation,
                  value: value[subKey],
                });
              });              
          }

          if (this.typeService === 'pay-in' && this.serviceLabelsMap['consolidated-pay-in'].includes(subKey)) {
            this.translate
              .get(
                'IP.' +
                'CARD_TABLE.' +
                  this.typeService.toUpperCase() + "." +
                  subKey.toUpperCase()
              )
              .subscribe((translation: string) => {
                infoArray.push({
                  key: translation,
                  value: value[subKey],
                });
              });
              
          }
          if (this.typeService === 'invoice' && this.serviceLabelsMap.invoice.includes(subKey)) {
            this.translate
              .get(
                'IP.' +
                'CARD_TABLE.' +
                  this.typeService.toUpperCase() + "." +
                  subKey.toUpperCase()
              )
              .subscribe((translation: string) => {
                infoArray.push({
                  key: translation,
                  value: value[subKey],
                });
              });
              
          }
          if (this.typeService === 'surrenders' && this.serviceLabelsMap.surrenders.includes(subKey)) {
            this.translate
              .get(
                'IP.' +
                'CARD_TABLE.' +
                  this.typeService.toUpperCase() + "." +
                  subKey.toUpperCase()
              )
              .subscribe((translation: string) => {
                infoArray.push({
                  key: translation,
                  value: value[subKey],
                });
              });
              
          }
          if (this.typeService === 'supplier' && this.serviceLabelsMap.supplier.includes(subKey)) {
            this.translate
              .get(
                'IP.' +
                'CARD_TABLE.' +
                  this.typeService.toUpperCase() + "." +
                  subKey.toUpperCase()
              )
              .subscribe((translation: string) => {
                infoArray.push({
                  key: translation,
                  value: value[subKey],
                });
              });
              
          }
          if (this.service === 'active-contracts' && this.serviceLabelsMap['active-contracts'].includes(subKey)) {
            this.translate
              .get(
                'IP.' +
                'CARD_TABLE.' +
                  this.service.toUpperCase() + "." +
                  subKey.toUpperCase()
              )
              .subscribe((translation: string) => {
                infoArray.push({
                  key: translation,
                  value: value[subKey],
                });
              });
              
          }
          if (this.service === 'purchase-order' && this.serviceLabelsMap['purchase-order'].includes(subKey)) {
            this.translate
              .get(
                'IP.' +
                'CARD_TABLE.' +
                  this.service.toUpperCase() + "." +
                  subKey.toUpperCase()
              )
              .subscribe((translation: string) => {
                infoArray.push({
                  key: translation,
                  value: value[subKey],
                });
              });
              
          }
          if (this.service === 'settlements' && this.serviceLabelsMap.settlements.includes(subKey)) {
            this.translate
              .get(
                'IP.' +
                'CARD_TABLE.' +
                  this.service.toUpperCase() + "." +
                  subKey.toUpperCase()
              )
              .subscribe((translation: string) => {
                infoArray.push({
                  key: translation,
                  value: value[subKey],
                });
              });
              
          }
          if (this.typeService === 'sales' && this.serviceLabelsMap.sales.includes(subKey)) {
            this.translate
              .get(
                'IP.' +
                'CARD_TABLE.' +
                  this.typeService.toUpperCase() + "." +
                  subKey.toUpperCase()
              )
              .subscribe((translation: string) => {
                infoArray.push({
                  key: translation,
                  value: value[subKey],
                });
              });
              
          }
          if (this.service === 'sales-settlement' && this.serviceLabelsMap['sales-settlement'].includes(subKey)) {
            this.translate
              .get(
                'IP.' +
                'CARD_TABLE.' +
                  this.typeService.toUpperCase() + "." +
                  subKey.toUpperCase()
              )
              .subscribe((translation: string) => {
                infoArray.push({
                  key: translation,
                  value: value[subKey],
                });
              });
              
          }
          if (this.service === 'flowstatus' && this.serviceLabelsMap['flowstatus'].includes(subKey)) {
            this.translate
              .get(
                'IP.' +
                'CARD_TABLE.' +
                  this.service.toUpperCase() + "." +
                  subKey.toUpperCase()
              )
              .subscribe((translation: string) => {
                if(this.setFlowStatus(translation, value[subKey])){
                  infoArray.push({
                    key: translation,
                    value: value[subKey],
                  });
                }
              });
          }
          if (this.service === 'roles' && this.serviceLabelsMap.roles.includes(subKey)) {
            this.translate
              .get(
                'IP.' +
                'CARD_TABLE.' +
                  this.service.toUpperCase() + "." +
                  subKey.toUpperCase()
              )
              .subscribe((translation: string) => {
                infoArray.push({
                  key: translation,
                  value: value[subKey],
                });
              });
          }
          if (this.service === 'transitions' && this.serviceLabelsMap.transitions.includes(subKey)) {
            this.translate
              .get(
                'IP.' +
                'CARD_TABLE.' +
                  this.service.toUpperCase() + "." +
                  subKey.toUpperCase()
              )
              .subscribe((translation: string) => {
                infoArray.push({
                  key: translation,
                  value: this.setValueTransitions( translation, value[subKey]),
                });
              });
          }
          if (this.typeService === 'costCenter' && this.serviceLabelsMap['cost-center'].includes(subKey)) {
            this.translate
              .get(
                'IP.' +
                'CARD_TABLE.' +
                  this.typeService.toUpperCase() + "." +
                  subKey.toUpperCase()
              )
              .subscribe((translation: string) => {
                infoArray.push({
                  key: translation,
                  value: value[subKey],
                });
              });
          }
          if (this.service === 'user-management' && this.serviceLabelsMap['user-management'].includes(subKey)) {
            this.translate
              .get(
                'IP.' +
                'CARD_TABLE.' +
                  this.typeService.toUpperCase() + "." +
                  subKey.toUpperCase()
              )
              .subscribe((translation: string) => {
                infoArray.push({
                  key: translation,
                  value: value[subKey],
                });
              });
          }
          if (this.service === 'admin-management' && this.serviceLabelsMap['admin-management'].includes(subKey)) {
            this.translate
              .get(
                'IP.' +
                'CARD_TABLE.' +
                  this.typeService.toUpperCase() + "." +
                  subKey.toUpperCase()
              )
              .subscribe((translation: string) => {
                infoArray.push({
                  key: translation,
                  value: value[subKey],
                });
              });
          }
          if (this.service === 'employee-management' && this.serviceLabelsMap['employee-management'].includes(subKey)) {
            this.translate
              .get(
                'IP.' +
                'CARD_TABLE.' +
                  this.typeService.toUpperCase() + "." +
                  subKey.toUpperCase()
              )
              .subscribe((translation: string) => {
                infoArray.push({
                  key: translation,
                  value: value[subKey],
                });
              });
          }
          if (this.service === 'subsidiaries' && this.serviceLabelsMap.subsidiaries.includes(subKey)) {
            this.translate
              .get(
                'IP.' +
                'CARD_TABLE.' +
                  this.typeService.toUpperCase() + "." +
                  subKey.toUpperCase()
              )
              .subscribe((translation: string) => {
                infoArray.push({
                  key: translation,
                  value: value[subKey],
                });
              });
          }
          if (this.service === 'card-transactions' && this.serviceLabelsMap['card-transactions'].includes(subKey)) {
            this.translate
              .get(
                'IP.TABLE.' +
                  this.service.toUpperCase() +
                  '.CARD.' +
                  subKey.toUpperCase()
              )
              .subscribe((translation: string) => {
                infoArray.push({
                  key: translation,
                  value: value[subKey],
                });
              });
          }
          if (this.service === 'invoice-to-pay' && this.serviceLabelsMap['invoice-to-pay'].includes(subKey)) {
            this.translate
              .get(
                'IP.TABLE.' +
                  this.service.toUpperCase() +
                  '.CARD.' +
                  subKey.toUpperCase()
              )
              .subscribe((translation: string) => {
                infoArray.push({
                  key: translation,
                  value: value[subKey],
                });
              });
          }
          if (this.service === 'account-transactions' && this.serviceLabelsMap['account-transactions'].includes(subKey)) {
            this.translate
              .get(
                'IP.TABLE.' +
                  this.service.toUpperCase() +
                  '.CARD.' +
                  subKey.toUpperCase()
              )
              .subscribe((translation: string) => {
                infoArray.push({
                  key: translation,
                  value: value[subKey],
                });
              });
          }
          if (this.service === 'payments-done' && this.serviceLabelsMap['payments-done'].includes(subKey)) {
            this.translate
              .get(
                'IP.TABLE.' +
                  this.service.toUpperCase() +
                  '.CARD.' +
                  subKey.toUpperCase()
              )
              .subscribe((translation: string) => {
                infoArray.push({
                  key: translation,
                  value: value[subKey],
                });
              });
          }
          if (this.service === 'payments-ongoing' && this.serviceLabelsMap['payments-ongoing'].includes(subKey)) {
            this.translate
              .get(
                'IP.TABLE.' +
                  this.service.toUpperCase() +
                  '.CARD.' +
                  subKey.toUpperCase()
              )
              .subscribe((translation: string) => {
                infoArray.push({
                  key: translation,
                  value: value[subKey],
                });
              });
          }
          if (this.service === 'supplier-accounts' && this.serviceLabelsMap['supplier-accounts'].includes(subKey)) {
            if (subKey === 'supplierId') {
              infoArray.push({
                key: 'supplierId',
                value: value.supplierId,
              });
            } else {
              this.translate
                .get(
                  'IP.TABLE.' +
                    this.service.toUpperCase() +
                    '.CARD.' +
                    subKey.toUpperCase()
                )
                .subscribe((translation: string) => {
                  infoArray.push({
                    key: translation,
                    value: value[subKey],
                    originalKey: subKey,
                  });
                });
            }
          }
        }

        const consolidatedTemplateOrderedKeys = [
          this.translate.instant('IP.PAYMENTS.DETAILS.OWNER_NAME'),
          this.translate.instant('IP.PAYMENTS.DETAILS.ACCNUMBER'),
          this.translate.instant('IP.PAYMENTS.DETAILS.BANK'),
          this.translate.instant('IP.PAYMENTS.DETAILS.BRANCH_NUMBER'),
          this.translate.instant('IP.PAYMENTS.DETAILS.INVOICES_TOTAL'),
          this.translate.instant('IP.PAYMENTS.DETAILS.AMOUNT'),
        ];

        const consolidatedOrderedKeys = [
          this.translate.instant('IP.CARD_TABLE.CONSOLIDATED.ID_CONSOLIDATED'),
          this.translate.instant('IP.CARD_TABLE.CONSOLIDATED.CONSOLIDATED_NAME'),
          this.translate.instant('IP.CARD_TABLE.CONSOLIDATED.DATETIME_GENERATED'), 
          this.translate.instant('IP.CARD_TABLE.CONSOLIDATED.TOTAL_PROVIDERS'),
          this.translate.instant('IP.CARD_TABLE.CONSOLIDATED.TOTAL_INVOICES'),
          this.translate.instant('IP.CARD_TABLE.CONSOLIDATED.TOTAL_AMOUNT'),
        ];

        const payInOrderedKeys = [
          this.translate.instant('IP.CARD_TABLE.PAY-IN.IDDB'),
          this.translate.instant('IP.CARD_TABLE.PAY-IN.TRANSACTIONID'),
          this.translate.instant('IP.CARD_TABLE.PAY-IN.PAYMENTTYPE'), 
          this.translate.instant('IP.CARD_TABLE.PAY-IN.DATE'),
          this.translate.instant('IP.CARD_TABLE.PAY-IN.AMOUNT'),
        ];

        const invoiceOrderedKeys = [
          this.translate.instant('IP.CARD_TABLE.INVOICE.FISCALID'),
          this.translate.instant('IP.CARD_TABLE.INVOICE.SUPPLIERNAME'),
          this.translate.instant('IP.CARD_TABLE.INVOICE.TYPESTATUS'),
          this.translate.instant('IP.CARD_TABLE.INVOICE.LOADINGDATE'),
          this.translate.instant('IP.CARD_TABLE.INVOICE.CREATIONDATE'),
          this.translate.instant('IP.CARD_TABLE.INVOICE.DUEDATE'),
        ];

        const surrendersOrderedKeys = [
          this.translate.instant('IP.CARD_TABLE.SURRENDERS.ID'),
          this.translate.instant('IP.CARD_TABLE.SURRENDERS.USERNAME'),
          this.translate.instant('IP.CARD_TABLE.SURRENDERS.TYPESTATUS'),
          this.translate.instant('IP.CARD_TABLE.SURRENDERS.CONCEPT'),
          this.translate.instant('IP.CARD_TABLE.SURRENDERS.CREATIONDATE'),
          this.translate.instant('IP.CARD_TABLE.SURRENDERS.AMOUNT'),
        ];

        const supplierOrderedKeys = [
          this.translate.instant('IP.CARD_TABLE.SUPPLIER.ID'),
          this.translate.instant('IP.CARD_TABLE.SUPPLIER.BUSINESSNAME'),
          this.translate.instant('IP.CARD_TABLE.SUPPLIER.STATE'),
          this.translate.instant('IP.CARD_TABLE.SUPPLIER.USEREMAIL'),
          this.translate.instant('IP.CARD_TABLE.SUPPLIER.USERNAME'),
          this.translate.instant('IP.CARD_TABLE.SUPPLIER.USERCREATIONDATE'),
          this.translate.instant('IP.CARD_TABLE.SUPPLIER.LASTLOGINDATE'),
        ];

        const contractsOrderedKeys = [
          this.translate.instant('IP.CARD_TABLE.ACTIVE-CONTRACTS.CONTRACTID'),
          this.translate.instant('IP.CARD_TABLE.ACTIVE-CONTRACTS.SUPPLIERNAME'),
          this.translate.instant('IP.CARD_TABLE.ACTIVE-CONTRACTS.ISACTIVE'),
          this.translate.instant('IP.CARD_TABLE.ACTIVE-CONTRACTS.NAME'),
          this.translate.instant('IP.CARD_TABLE.ACTIVE-CONTRACTS.COSTCENTERNAME'),
          this.translate.instant('IP.CARD_TABLE.ACTIVE-CONTRACTS.STARTDATE'),
          this.translate.instant('IP.CARD_TABLE.ACTIVE-CONTRACTS.FINISHDATE'),
        ];

        const purcharseOrderedKeys = [
          this.translate.instant('IP.CARD_TABLE.PURCHASE-ORDER.PURCHASEID'),
          this.translate.instant('IP.CARD_TABLE.PURCHASE-ORDER.SUPPLIERNAME'),
          this.translate.instant('IP.CARD_TABLE.PURCHASE-ORDER.ISACTIVE'),
          this.translate.instant('IP.CARD_TABLE.PURCHASE-ORDER.NAME'),
          this.translate.instant('IP.CARD_TABLE.PURCHASE-ORDER.COSTCENTERNAME'),
          this.translate.instant('IP.CARD_TABLE.PURCHASE-ORDER.STARTDATE'),
          this.translate.instant('IP.CARD_TABLE.PURCHASE-ORDER.FINISHDATE'),
        ];

        const settlementsOrderedKeys = [
          this.translate.instant('IP.CARD_TABLE.SETTLEMENTS.SETTLEMENTID'),
          this.translate.instant('IP.CARD_TABLE.SETTLEMENTS.PROVIDERNAME'),
          this.translate.instant('IP.CARD_TABLE.SETTLEMENTS.STATUS'),
          this.translate.instant('IP.CARD_TABLE.SETTLEMENTS.CREATIONTIME'),
          this.translate.instant('IP.CARD_TABLE.SETTLEMENTS.STARTDATESETTLEMENT'),
          this.translate.instant('IP.CARD_TABLE.SETTLEMENTS.ENDDATESETTLEMENT'),
          this.translate.instant('IP.CARD_TABLE.SETTLEMENTS.SETTLEMENTSUMMARY'),
        ];

        const salesOrderedKeys = [
          this.translate.instant('IP.CARD_TABLE.SALES.SALEID'),
          this.translate.instant('IP.CARD_TABLE.SALES.BROKERNAMEBUSSINESS'),
          this.translate.instant('IP.CARD_TABLE.SALES.ISPAID'),
          this.translate.instant('IP.CARD_TABLE.SALES.IDSETTLEMENT'),
          this.translate.instant('IP.CARD_TABLE.SALES.CUSTOMERID'),
          this.translate.instant('IP.CARD_TABLE.SALES.PRODUCTNAME'),
          this.translate.instant('IP.CARD_TABLE.SALES.BILLID'),
          this.translate.instant('IP.CARD_TABLE.SALES.COMMISSIONPERCENTAGE'),
          this.translate.instant('IP.CARD_TABLE.SALES.SALEDATE'),
          this.translate.instant('IP.CARD_TABLE.SALES.COMISSIONAMOUNT'),
          this.translate.instant('IP.CARD_TABLE.SALES.EXPENSES'),
          this.translate.instant('IP.CARD_TABLE.SALES.SALEAMOUNT'),
        ];

        const employeeOrderedKeys = [
          this.translate.instant('IP.CARD_TABLE.EMPLOYEE.NUMBERID'),
          this.translate.instant('IP.CARD_TABLE.EMPLOYEE.USERNAME'),
          this.translate.instant('IP.CARD_TABLE.EMPLOYEE.USERSTATUS'),
          this.translate.instant('IP.CARD_TABLE.EMPLOYEE.EMAIL'),
          this.translate.instant('IP.CARD_TABLE.EMPLOYEE.POSITION'),
          this.translate.instant('IP.CARD_TABLE.EMPLOYEE.ENTERPRISE'),
          this.translate.instant('IP.CARD_TABLE.EMPLOYEE.ROLE'),
          this.translate.instant('IP.CARD_TABLE.EMPLOYEE.USERCREATIONDATE'),
        ];

        const subsidiariesOrderedKeys = [
          this.translate.instant('IP.CARD_TABLE.SUBSIDIARIES.BUSSINESID'),
          this.translate.instant('IP.CARD_TABLE.SUBSIDIARIES.BUSINESSNAME'),
          this.translate.instant('IP.CARD_TABLE.SUBSIDIARIES.CONTACTNUMBER'),
          this.translate.instant('IP.CARD_TABLE.SUBSIDIARIES.COUNTRY'),
          this.translate.instant('IP.CARD_TABLE.SUBSIDIARIES.ADDRESSES')
        ];

        if (invoiceArray.length > 0) {
          invoiceArray.forEach((item: any) => {
            if (
              item.key ===
                this.translate.instant('IP.INVOICES.CARD.TYPESTATUS') &&
              typeof item.value === 'object'
            ) {
              item.value = item.value.status;
            } else if (
              item.key === this.translate.instant('IP.INVOICES.CREATIONDATE') ||
              item.key === this.translate.instant('IP.INVOICES.DUEDATE') ||
              item.key === this.translate.instant('IP.INVOICES.LOADINGDATE')
            ) {
              item.value = this.customDate.transform(item.value);
            }
          });
          // Ordenar labelsArray
          
          invoiceArray.sort((a: any, b: any) => {
            const indexA = invoiceOrderedKeys.indexOf(a.key);
            const indexB = invoiceOrderedKeys.indexOf(b.key);

            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;

            return indexA - indexB;
          });

          // this.labelsArrayTest.data.push(invoiceArray);
        }

        if (infoArray.length > 0) {
          if(this.typeService === 'consolidated-template'){
            infoArray = this.sortArray(infoArray, consolidatedTemplateOrderedKeys);
          }
          if(this.typeService === 'consolidated'){
            infoArray = this.sortArray(infoArray, consolidatedOrderedKeys);
          }
          if(this.typeService === 'pay-in'){
            infoArray = this.sortArray(infoArray, payInOrderedKeys);
          }
          if(this.typeService === 'invoice'){
            infoArray = this.sortArray(infoArray, invoiceOrderedKeys);
          }
          if(this.typeService === 'surrenders'){
            infoArray = this.sortArray(infoArray, surrendersOrderedKeys);
          }
          if(this.typeService === 'supplier'){
            infoArray = this.sortArray(infoArray, supplierOrderedKeys);
          }
          if(this.service === 'active-contracts'){
            infoArray = this.sortArray(infoArray, contractsOrderedKeys);
          }
          if(this.service === 'purchase-order'){
            infoArray = this.sortArray(infoArray, purcharseOrderedKeys);
          }
          if(this.service === 'settlements'){
            infoArray = this.sortArray(infoArray, settlementsOrderedKeys);
          }
          if(this.typeService === 'sales'){
            infoArray = this.sortArray(infoArray, salesOrderedKeys);
          }
          if(this.typeService === 'employee'){
            infoArray = this.sortArray(infoArray, employeeOrderedKeys);
          }
          if(this.typeService === 'subsidiaries'){
            infoArray = this.sortArray(infoArray, subsidiariesOrderedKeys);
          }
          this.labelsArrayTest.push({
            id: this.setIdLabelArrays(value),
            data: infoArray
          });
        }

      }
    }
  }

  setIdLabelArrays(value: any){
    if(['invoice', 'surrenders', 'supplier', 'project', 'sales', 'configuration', 'subsidiaries', 'employee', 'consolidated'].includes(this.typeService)){
      return value.id.toString();
    }
    if(['settlements'].includes(this.typeService)){
      return value.settlementId.toString();
    }
    if(['costCenter'].includes(this.typeService)){
      return value.id.toString();
    }
    if(['pay-in'].includes(this.typeService)){
      return value.idDB.toString();
    }
    return null;
  }

  getDataField(value: string){
    if(['invoice', 'surrenders', 'supplier', 'project', 'sales', 'configuration', 'subsidiaries', 'employee'].includes(this.typeService)){
      const id: number = Number(value);
      if (this.service === 'invoice-to-pay'){
        const data = this.data.filter((item: any) => item.invoiceId == id)[0];
        return data;        
      }
      const data = this.data.filter((item: any) => item.id == id)[0];
      return data;
    }
    if(['pay-in'].includes(this.typeService)){
      const data = this.data.filter((item: any) => item.id == value)[0];
      return data;
    }
    if(['settlements'].includes(this.typeService)){
      const settlementId: number = Number(value);
      const data = this.data.filter((item: any) => item.settlementId == settlementId)[0];
      return data;
    }
    if(['costCenter'].includes(this.typeService)){
      const costCenterId: number = Number(value);
      const data = this.data.filter((item: any) => item.id == costCenterId)[0];
      return data;
    }
    if(['consolidated'].includes(this.typeService)){
      const id: number = Number(value);
      const data = this.data.filter((item: any) => item.id_consolidated == id)[0];
      return data;
    }
  }

  selectSale(ev: MatCheckboxChange, field: any){
    const sale: any = this.getDataField(field.id);
    this.selectedSales.emit({ev, selectSale: sale})
  }

  isSaleChecked(field: any){
    const sale: any = this.getDataField(field.id);
    return this.saleCheckedEvent.emit(sale);
  }

  sortArray(array: any, orderKey: any[]){

    array.sort((a: any, b: any) => {
      const indexA = orderKey.indexOf(a.key);
      const indexB = orderKey.indexOf(b.key);

      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    });
    return array;
  }

  private setInfoCard() {
    this.primaryInfo = [];
    this.secondaryInfo = [];
    this.datesInfo = [];

    this.data.forEach((field: any) => {
      const primaryInfo: string[] = [];
      const secondaryInfo: string[] = [];
      const datesInfo: string[] = [];

      for (let keyName in field) {
        const keyLower = keyName.toLowerCase();

        if (
          keyLower.includes('invoice') ||
          keyLower.includes('amount') ||
          (this.keyColumns.includes('id') && keyLower == 'id') ||
          keyLower.includes('#')
        ) {
          const value =
            this.transform.transform(
              field[keyName],
              keyName,
              this.keyTranslate
            ) + '';
          primaryInfo.push(value);
        } else if (keyLower.includes('date')) {
          const value =
            this.transform.transform(
              field[keyName],
              keyName,
              this.keyTranslate
            ) + '';
          datesInfo.push(value);
        } else if (keyLower.includes('name') || keyLower.includes('email')) {
          const value =
            this.transform.transform(
              field[keyName],
              keyName,
              this.keyTranslate
            ) + '';
          secondaryInfo.push(value);
        } else if (keyLower.includes('state')) {
          const value =
            this.transform.transform(
              field[keyName],
              keyName,
              this.keyTranslate
            ) + '';
          this.states.push(value);
        } else if (keyLower.includes('enterprise')) {
          const value =
            this.transform.transform(
              field[keyName],
              keyName,
              this.keyTranslate
            ) + '';
          datesInfo.push(value);
        } else if (keyLower.includes('rol')) {
          const value =
            this.transform.transform(
              field[keyName],
              keyName,
              this.keyTranslate
            ) + '';
          datesInfo.push(value);
        } else if (keyLower.includes('country')) {
          const value =
            this.transform.transform(
              field[keyName],
              keyName,
              this.keyTranslate
            ) + '';
          datesInfo.push(value);
        } else if (keyLower.includes('address')) {
          const value =
            this.transform.transform(
              field[keyName],
              keyName,
              this.keyTranslate
            ) + '';
          datesInfo.push(value);
        }
      }

      this.primaryInfo.push(this.getStringProcess(primaryInfo, '    -    '));
      // this.datesInfo.push(this.getStringProcess(datesInfo, '  -  '));
      let secondaryInfoString = this.getStringProcess(
        secondaryInfo.slice(0, 2),
        '|'
      );
      this.secondaryInfo.push(secondaryInfoString.split('|'));
    });
  }

  private getTranslate(key: string): string | undefined {
    const fullKey: string = this.keyTranslate + '.' + key.toUpperCase();
    const translate: string = this.translate.instant(fullKey);
    return translate == fullKey ? undefined : translate;
  }

  onAction(action: string, dataField: any) {
    this.currentMenuIndex = null
    const dataFieldValue: any = this.getDataField(dataField.id);
    this.action.emit({ event: action, dataField: dataFieldValue });
  }

  // isDisabled(action: string, dataField: any){
  //   const dataFieldValue: any = this.getDataField(dataField.id);
  //   if(this.service === "flowstatus"){
  //     if(action === "delete"){

  //     }
  //   }
  // }


  // onAction(action: string, dataField: any) {
  //   let supplierId;
  //   let businessName;
  //   let userName;
  //   let cardNumber;
  //   let cardNetwork;

    // dataField.forEach((field: any) => {
    //   console.log("Field", field)
    //   if (field.key === "supplierId") {
    //     supplierId = field.value;
    //   }
    //   else if (field.originalKey === "businessName") {
    //     businessName = field.value;
    //   }
    //   else if (field.originalKey === "userName") {
    //     userName = field.value;
    //   }
    //   else if (field.originalKey === "cardNumber") {
    //     cardNumber = field.value;
    //   }
    //   else if (field.originalKey === "cardNetwork") {
    //     cardNetwork = field.value;
    //   } else if (field.key === 'ID Consolidado'){
    //     dataField = this.data[0];
    //    this.action.emit({ event: action, dataField});
    //    return;
    //   }
    // });
  //   for (const field of dataField) {
  //     if (field.key === 'supplierId') {
  //       supplierId = field.value;
  //     } else if (field.originalKey === 'businessName') {
  //       businessName = field.value;
  //     } else if (field.originalKey === 'userName') {
  //       userName = field.value;
  //     } else if (field.originalKey === 'cardNumber') {
  //       cardNumber = field.value;
  //     } else if (field.originalKey === 'cardNetwork') {
  //       cardNetwork = field.value;
  //     } else if (field.key === 'ID Consolidado') {
  //       dataField = { ...this.data[0], cardMobiles: true };

  //       this.action.emit({ event: action, dataField });
  //       return;
  //     }
  //   }
  //   if (supplierId) {
  //     dataField = {
  //       supplierId,
  //       businessName,
  //       userName,
  //       cardNumber,
  //       cardNetwork,
  //     };
  //   }
  //   this.action.emit({ event: action, dataField });
  // }

  isActionSensitive(action: string, state: string) {
    let isSensitive = this.actionsIf.find((actionActive: ActionActive) => {
      return actionActive.action == action;
    });
    if (isSensitive) {
      return this.actionsIf.find((actionActive: ActionActive) => {
        return actionActive.state == state;
      });
    }
    return false;
  }

  getStringProcess(values: any[], separator: string) {
    let stringProcess = '';
    const length = values.length;

    values.forEach((value: any, index: number) => {
      stringProcess += index + 1 != length ? value + separator : value;
    });

    return stringProcess;
  }

  trackByFn(index: number, key: any): number {
    return key;
  }

  getTooltipText(action: string, dataField: { isReported: boolean }): string {
    const tooltips: Record<string, string> = {
      report: dataField.isReported
        ? this.translate.instant('IP.ACTIONS_TOOLTIP.REPORTED')
        : this.translate.instant('IP.ACTIONS_TOOLTIP.REPORT'),
      edit: this.translate.instant('IP.ACTIONS_TOOLTIP.EDIT'),
      delete: this.translate.instant('IP.ACTIONS_TOOLTIP.DELETE'),
      import: this.translate.instant('IP.ACTIONS_TOOLTIP.IMPORT'),
      pay: this.translate.instant('IP.ACTIONS_TOOLTIP.PAY'),
      info: this.translate.instant('IP.ACTIONS_TOOLTIP.INFO'),
      file: this.translate.instant('IP.ACTIONS_TOOLTIP.FILE'),
      comment: this.translate.instant('IP.ACTIONS_TOOLTIP.COMMENT'),
    };

    return tooltips[action] || '';
  }

  setFlowStatus(key: any, val: any): any{
    if((key === this.translate.instant('IP.CARD_TABLE.FLOWSTATUS.ISINITIAL') ||
     key === this.translate.instant('IP.CARD_TABLE.FLOWSTATUS.ISPAID') || 
     key === this.translate.instant('IP.CARD_TABLE.FLOWSTATUS.ISPAYABLE') ||
     key === this.translate.instant('IP.CARD_TABLE.FLOWSTATUS.ISREJECTED')) && val === false) {return false}
     else if(key === this.translate.instant('IP.CARD_TABLE.FLOWSTATUS.DESCRIPTION')){
      return false
     }
     else{
      return true 
     }
  }

  setValueTransitions(key: string, value: any):string{
    if(key === this.translate.instant('IP.CARD_TABLE.TRANSITIONS.CURRENTSTATUS') || key === this.translate.instant('IP.CARD_TABLE.TRANSITIONS.NEXTSTATUS')){
      return value.status
    }
    return value
  }

  formatCardNumber(cardNumber: string): string {
    const cardNumberParts = [];
    for (let i = 0, j = 0; i < 4; i++) {
      cardNumberParts[i] = cardNumber.substring(j, j + 4);
      j += 4;
    }
    return '···· ' + cardNumberParts[3];
  }

  getFormattedRoles(val: any): string {
    if (!val.value || val.value.length === 0) {
      return '-';
    }
    if (val.value.length === 1) {
      return `${val.value[0].name}.`;
    }
    return val.value.map((item: any) => item.name).join('-');
  }

  executeService() {}

  isType(value:any){
    if (value === null) return 0
    if (typeof(value) == 'number') return value
    if (typeof(value) == 'string') {
      const newVal = value.split(' ')
      return newVal[1] ?? newVal[0]
    }
    else return value.settlementCommissionAmount
  }

  checkActionDisable(dataField: any, action: string): boolean {
    const dataFieldValue: any = this.getDataField(dataField.id);
    switch (action) {
      case 'report':
        if (dataFieldValue.typeStatus?.isPaid) {
          return true
        }
        break;
      case 'delete':
        if (dataFieldValue.typeStatus && !dataFieldValue.typeStatus.isPaid) {
          return true
        } else if (dataFieldValue.typeStatus && !dataFieldValue.typeStatus.isInitial) {
          return true          
        } else if (dataFieldValue.status?.statusCode === "closed") {
          return true      
        } else if (dataFieldValue.idSettlement != null) {
          return true      
        }
        break;
      case 'pay':
        if (
          !dataFieldValue.typeStatus.isPayable
        ) {
          return true
        }
        break;
      case 'block':
        if (dataFieldValue.cardStatus !== 'ACTIVE') {
          return true
        }
        break;
      case 'conciliate':
        if (dataFieldValue.conciliate === true || dataFieldValue.isPaid) {
          return true
        }
        break;
      case 'status':
        if (dataFieldValue.status === 'PAID') {
          return true
        }
        break;
    }
    return false;
  }
  
}
