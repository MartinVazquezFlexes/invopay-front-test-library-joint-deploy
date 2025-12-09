import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { TransformDataTablePipe } from '../../Utils/transform-data-table.pipe';
import { ActionActive, TableEvent } from './Itable';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit, OnChanges {
  type!: 'business' | 'employee' | 'provider';
  tableHeads: any;
  historySorts: any[] = [];
  keyColumns: string[] = [];
  @Input() propertyOrder: string[] = [];
  @Input() data: any = [];
  @Input() actions: string[] = [];
  @Input() keyTranslate!: string;
  @Input() tableStyle: string = '';
  @Output() sort: EventEmitter<TableEvent> = new EventEmitter<TableEvent>();
  @Output() action: EventEmitter<TableEvent> = new EventEmitter<TableEvent>();
  @Input() actionsIf: ActionActive[] = [];
  @Input() optionalTitle?: string;
  @Input() isForSelectItem?: boolean;
  @Output() selectedItemsChange = new EventEmitter<any>();
  @Input() initTable = false;
  @Input() actionKey?: string;
  @Input() scroll = false;
  @Input() forErrors = false;
  @Input() titlesFile?: Map<string,string>
  @Input() showAddButtonInHeader: boolean = false;
  @Output() addAction = new EventEmitter<void>();
  @Input() addButtonTooltipText: string = '';
  

  selectedItems: Set<any> = new Set();
  selectAllChecked = false;
  selectSomeChecked = false;

  constructor(
    private translate: TranslateService,
    //private transformDataTablePipe: TransformDataTablePipe
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && !changes['data'].firstChange) {
      this.tableHeads = this.setTableHeads();
    }
  }

  ngOnInit(): void {
    this.type = 'business';
    this.tableHeads = this.setTableHeads();
    this.onLangChange();
  }

  onLangChange() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.tableHeads = this.setTableHeads();
    });
  }
  onAddClick(): void {
    this.addAction.emit();
  }

  private setTableHeads(): any {    
    let headerArray = [];
    let translationMap: { [key: string]: string } = {};
    // Iterate through the properties in the desired order

    for (const key of this.propertyOrder) {
      let translate: string | undefined;
      if (this.keyTranslate !==''){

        translate = this.getTranslate(key);
      }else{
        translate = key
      }

      if (this.titlesFile){
        headerArray.push(key);
        translationMap[key] = this.titlesFile.get(key) ?? key
      } else if (translate){         
        headerArray.push(key);
        translationMap[key] = translate;
      }
    }
    this.keyColumns = headerArray;
    return translationMap;
  }

  private getTranslate(key: string): string | undefined {
    const fullKey: string = this.keyTranslate + '.' + key.toUpperCase();
    const translate: string = this.translate.instant(fullKey);
    return translate == fullKey ? undefined : translate;
  }

  onAction(action: string, dataField: any) {
    this.action.emit({ event: action, dataField });
  }

  toggleSelectAllInvoices() {
    this.selectAllChecked = !this.selectAllChecked;
    if (this.selectAllChecked) {
      this.data.forEach((item: any) => this.selectedItems.add(item));
      this.selectedItemsChange.emit(Array.from(this.selectedItems));
    } else {
      this.selectedItems.clear();
      this.selectSomeChecked = false;
      this.selectedItemsChange.emit(Array.from(this.selectedItems));
    }
  }

  toggleItemSelection(item: any) {
    if (this.selectedItems.has(item)) {
      this.selectedItems.delete(item);
      this.selectedItemsChange.emit(Array.from(this.selectedItems));
    } else {
      this.selectedItems.add(item);
      this.selectedItemsChange.emit(Array.from(this.selectedItems));
    }
    this.selectAllChecked = this.selectedItems.size == this.data.length
    this.selectSomeChecked = this.selectedItems.size > 0
  }

  isItemSelected(item: any): boolean {
    return this.selectedItems.has(item);
  }

  onSort(event: Event, key: string) {
    if (!this.isSortable(key)) {
      return;
    }
    const elementSort = (event.target as HTMLElement).firstElementChild
      ?.firstElementChild;
    const classListSort = elementSort?.classList;
    const hasUp = classListSort?.contains('up');
    const hasDown = classListSort?.contains('down');
    this.resetOtherSorts(elementSort);
    this.historySorts.push(elementSort);
    if (!(hasUp || hasDown)) {
      classListSort?.add('down');
      this.sort.emit({ event: 'desc', key });
    } else if (hasDown) {
      classListSort?.remove('down');
      classListSort?.add('up');
      this.sort.emit({ event: 'asc', key });
    } else if (hasUp) {
      classListSort?.remove('down', 'up');
      this.sort.emit({ event: 'clean', key });
    }
  }

  sortableFields: String[] = [
    // 'id',
    'loadingDate',
    'creationDate',
    'dueDate',
    'reportDate',
    'paymentDate',
    'concept',
    'renditionType',
    'position',
    'enterprise',
    'businessName',
    'costCenterName',
  ];

  isSortable(key: string): boolean {
    // A trick to ignore specific sorts on suppliers and projects tables
    if (!this.keyTranslate.includes('TABLE_SUPPLIERS')) {
      this.sortableFields.push('username');
    }
    if (
      !this.keyTranslate.includes('ACTIVE-CONTRACT') &&
      !this.keyTranslate.includes('TABLE_PURCHASE')
    ) {
      this.sortableFields.push('supplierName');
    }
    return this.sortableFields.includes(key);
  }

  private resetOtherSorts(element: Element | null | undefined) {
    this.historySorts.forEach((sortElement: any) => {
      sortElement != element
        ? sortElement.classList.remove('up', 'down')
        : null;
    });
  }

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

  generateTooltip(data: any, key: string, keyTranslate: string) {
    //const transformedData = this.transformDataTablePipe.transform(
    //  data,
    //  key,
    //  keyTranslate
    //) as string;
    
    //if (transformedData.toString().includes('...')) {
    //  return data;
    //}
    return '';
  }

  getTooltipText(action: string, dataField: { reportDate: boolean }): string {
    const tooltips: Record<string, string> = {
      report: dataField.reportDate
        ? this.translate.instant('IP.ACTIONS_TOOLTIP.REPORTED')
        : this.translate.instant('IP.ACTIONS_TOOLTIP.REPORT'),
      edit: this.translate.instant('IP.ACTIONS_TOOLTIP.EDIT'),
      delete: this.translate.instant('IP.ACTIONS_TOOLTIP.DELETE'),
      import: this.translate.instant('IP.ACTIONS_TOOLTIP.IMPORT'),
      pay: this.translate.instant('IP.ACTIONS_TOOLTIP.PAY'),
      info: this.translate.instant('IP.ACTIONS_TOOLTIP.INFO'),
      file: this.translate.instant('IP.ACTIONS_TOOLTIP.FILE'),
      search: this.translate.instant('IP.ACTIONS_TOOLTIP.SEARCH'),
      comment: this.translate.instant('IP.ACTIONS_TOOLTIP.COMMENT'),
      block: this.translate.instant('IP.ACTIONS_TOOLTIP.BLOCK'),
      detail: this.translate.instant('IP.ACTIONS_TOOLTIP.DETAIL'),
      download: this.translate.instant('IP.ACTIONS_TOOLTIP.IMPORT'),
      status: this.translate.instant('IP.ACTIONS_TOOLTIP.STATUS'),
      conciliate: this.translate.instant('IP.ACTIONS_TOOLTIP.CONCILIATE'),
      send_mail: this.translate.instant('IP.ACTIONS_TOOLTIP.SEND_MAIL'),
    };
    return tooltips[action] || '';
  }

  checkAction(dataField: any, action: string): any {
    let extension = '';
    let pointerEvents = 'all';
    switch (action) {
      case 'report':
        if (dataField.reportDate) {
          extension = 'ed';
          pointerEvents = 'none';
        } else if (dataField.typeStatus.isPaid) {
          extension = '-grey';
          pointerEvents = 'none';
        }
        break;
      case 'delete':
        if (
          // Checks wether it is a rendition or invoice
          // (a bill, cause there are other deletable entities)
          dataField.typeStatus &&
          // As an employee or provider, I can only delete the pending ones
          (((this.type === 'employee' || this.type === 'provider') &&
            !dataField.typeStatus.isInitial) ||
            // As an enterprise, only the paid ones
            (this.type === 'business' && !dataField.typeStatus.isPaid))
        ) {
          extension = '-grey';
          pointerEvents = 'none';
        } else if (dataField.typeStatus && !dataField.typeStatus.isInitial) {
          extension = '-grey';
          pointerEvents = 'none';
        } else if (dataField.status?.statusCode === "closed") {
          extension = '-grey';
          pointerEvents = 'none';
        }
        break;
      case 'pay':
        if (
          // I can only pay approved bills
          !dataField.typeStatus.isPayable
        ) {
          extension = '-grey';
          pointerEvents = 'none';
        }
        break;
      case 'block':
        if (dataField.cardStatus !== 'ACTIVE') {
          extension = '-grey';
          pointerEvents = 'none';
        }
        break;
      case 'conciliate':
        if (dataField.conciliate === true) {
          extension = '-grey';
          pointerEvents = 'none';
        }
        break;
      case 'status':
        if (dataField.status === 'PAID') {
          extension = '-grey';
          pointerEvents = 'none';
        }
        // if (dataField.is_paid === true) {
        //   extension = '-grey';
        //   pointerEvents = 'none';
        // }
        break;
    }
    return {
      icon: 'url(assets/img/table/' + action + extension + '.svg)',
      pointerEvents,
    };
  }

  tableStyles: any = {
    invopay: {
      dataHead: {
        'background-color': '#F9FAFC',
        color: '#a9adba',
        'font-weight': '500',
        // 'border-top': '1px solid #f0f3f8',
        // 'border-bottom': '1px solid #f0f3f8',
      },
      dataRow: {
        'background-color': '#FFFFFF',
        color: '#54617A',
        'font-weight': '400',
        'border-top': '1px solid #EFF3F9',
        'border-bottom': '1px solid #EFF3F9',
      },
    },
    invopayConciliations: {
      dataHead: {
        'background-color': '#F9FAFC',
        color: '#a9adba',
        'font-weight': '500',
        'min-width': '8rem'
      },
      dataRow: {
        'background-color': '#FFFFFF',
        color: '#54617A',
        'font-weight': '400',
        'border-top': '1px solid #EFF3F9',
        'border-bottom': '1px solid #EFF3F9',
      },
    },
  };
}
