import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { TransformDataTablePipe } from '../../Utils/transform-data-table.pipe';
import { ActionActive, TableEvent } from './Itable';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
  @Output() selectedAllItems = new EventEmitter<boolean>();
  @Input() initTable = false;
  @Input() actionKey?: string;
  @Input() scroll = false;
  @Input() forErrors = false;
  @Input() titlesFile?: Map<string, string>
  @Input() getRowId?: (item: any) => string;
  @Input() selectAllChecked = false;
  @Input() extraDataKeys?: Observable<any[]>;
  @Input() showExtraData = false;
  @Input() actionBtnLabel?: string;
  @Output() actionBtn: EventEmitter<TableEvent> = new EventEmitter<TableEvent>();
  @Input() columnWidths?: { [key: string]: string };
  @Input() showAddButtonInHeader: boolean = false;
  @Output() addAction = new EventEmitter<void>();
  @Input() addButtonTooltipText: string = '';

  selectedItems: Set<any> = new Set();
  selectSomeChecked = false;
  expandedRows: Set<any> = new Set();

  private memoizedStyles: { [key: string]: any } = {};

  constructor(
    private translate: TranslateService,
    private transformDataTablePipe: TransformDataTablePipe,
    private cdr: ChangeDetectorRef
  ) { }


  ngOnInit(): void {
    this.type = 'business';
    this.tableHeads = this.setTableHeads();
    this.onLangChange();
    this.showSelectAllChecked();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      if (!changes['data'].firstChange) {
        this.tableHeads = this.setTableHeads();
        this.cdr.markForCheck();
      }
    }

    if (changes['selectAllChecked'] && !changes['selectAllChecked'].firstChange) {
      this.showSelectAllChecked();
      this.cdr.markForCheck();
    }
  }

  onLangChange() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.tableHeads = this.setTableHeads();
      this.cdr.markForCheck();
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
      if (this.keyTranslate !== '') {

        translate = this.getTranslate(key);
      } else {
        translate = key
      }

      if (this.titlesFile) {
        headerArray.push(key);
        translationMap[key] = this.titlesFile.get(key) ?? key
      } else if (translate) {
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

  toggleSelectAllItems() {
    this.selectAllChecked = !this.selectAllChecked;
    this.selectedAllItems.emit(this.selectAllChecked)
    this.showSelectAllChecked();
  }

  showSelectAllChecked() {
    this.selectedItems.clear();
    if (this.selectAllChecked) {
      this.data.forEach((item: any) => {
        const itemId = this.getRowId ? this.getRowId(item) : item;
        this.selectedItems.add(itemId);
      });
      this.selectedItemsChange.emit(Array.from(this.selectedItems));
    } else {
      this.selectSomeChecked = false;
      this.selectedItemsChange.emit(Array.from(this.selectedItems));
    }
  }

  toggleItemSelection(item: any) {
    const itemId = this.getRowId ? this.getRowId(item) : item;
    if (this.selectedItems.has(itemId)) {
      this.selectedItems.delete(itemId);
      this.selectedItemsChange.emit(Array.from(this.selectedItems));
    } else {
      this.selectedItems.add(itemId);
      this.selectedItemsChange.emit(Array.from(this.selectedItems));
    }
    this.selectAllChecked = this.selectedItems.size == this.data.length
    this.selectSomeChecked = this.selectedItems.size > 0
    this.selectedAllItems.emit(this.selectAllChecked)
  }

  isItemSelected(item: any): boolean {
    const itemId = this.getRowId ? this.getRowId(item) : item;
    return this.selectedItems.has(itemId);
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
    const transformedData = this.transformDataTablePipe.transform(
      data,
      key,
      keyTranslate
    ) as string;

    if (transformedData.toString().includes('...')) {
      return data;
    }
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
        if (dataField.hasOwnProperty('isActive') && dataField.isActive === false) {
          extension = '-grey';
          pointerEvents = 'none';
        } else if (
          dataField.typeStatus &&
          (((this.type === 'employee' || this.type === 'provider') &&
            !dataField.typeStatus.isInitial) ||
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
        } else if (dataField.deletable !== null && dataField.deletable === false) {
          extension = '-grey';
          pointerEvents = 'none';
        }
        break;
      case 'edit':
        if (dataField.hasOwnProperty('isActive') && dataField.isActive === false) {
          extension = '-grey';
          pointerEvents = 'none';
        } else if (dataField.editable !== null && dataField.editable === false) {
          extension = '-grey';
          pointerEvents = 'none';
        }
        break;
      case 'pay':
        if (
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
        }
        break;
    }
    return {
      icon: 'url(assets/img/table/' + action + extension + '.svg)',
      pointerEvents,
    };
  }

  hasExtraData(): boolean {
    return this.extraDataKeys !== undefined;
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
    commissions: {
      dataHead: {
        'background-color': '#F9FAFC',
        color: '#a9adba',
        'font-weight': '500',
        'min-height': '2rem',
      },
      dataRow: {
        'background-color': '#FFFFFF',
        color: '#54617A',
        'font-weight': '400',
        'min-height': '2rem',
        padding: '0.25rem',
      }
    },
  };

  trackByDataField(index: number, item: any): any {
    return this.getRowId ? this.getRowId(item) : item.id || index;
  }

  trackByKey(index: number, key: string): string {
    return key;
  }


  getTableStyle(styleKey: string, type: 'dataHead' | 'dataRow'): any {
    const cacheKey = `${styleKey}_${type}`;
    if (!this.memoizedStyles[cacheKey]) {
      this.memoizedStyles[cacheKey] = this.tableStyles[styleKey]?.[type] || {};
    }
    return this.memoizedStyles[cacheKey];
  }

  disableCheck(dataField: any): boolean {
    if (dataField.status && dataField.status.statusCode && dataField.status.statusCode !== "open") return true
    else return false
  }

  onActionBtnEmit(action: string) {
    this.actionBtn.emit({ event: action })
  }

  private booleanMappings: { [key: string]: { true: string, false: string } } = {
    'isActive': { true: 'IP.TABLE.ACTIVE', false: 'IP.TABLE.INACTIVE' },
    'state': { true: 'IP.TABLE.ACTIVE', false: 'IP.TABLE.INACTIVE' },
    'isCommissionInvoice': { true: 'IP.YES', false: 'IP.NO' },
    'billed': { true: 'IP.YES', false: 'IP.NO' },
    'is_paid': { true: 'IP.YES', false: 'IP.NO' },
    'conciliate': { true: 'IP.YES', false: 'IP.NO' }
  };

  getBooleanDisplayValue(key: string, value: boolean, dataField: any): string {
    // Handle special cases for isActive
    if (key === 'isActive') {
      if (dataField.contractId) {
        return this.translate.instant(value ? 'IP.TABLE.ACTIVE' : 'IP.TABLE.INACTIVE');
      } else if (dataField.purchaseId) {
        return this.translate.instant(value ? 'IP.TABLE.ACTIVE2' : 'IP.TABLE.INACTIVE2');
      }
    }

    const mapping = this.booleanMappings[key];
    if (mapping) {
      return this.translate.instant(mapping[value.toString() as 'true' | 'false']);
    }
    return value.toString();
  }
  getColumnWidth(key: string, index: number): string | undefined {
    if (this.columnWidths && this.columnWidths[key]) {
      return this.columnWidths[key];
    }
    return undefined;
  }

  getRowStyle(type: 'dataHead' | 'dataRow', key: string, index: number): any {
    const cacheKey = `${this.tableStyle}_${type}_${key}_${index}`;
    if (this.memoizedStyles[cacheKey]) {
      return this.memoizedStyles[cacheKey];
    }
    const baseStyles = this.getTableStyle(this.tableStyle, type);
    const columnWidth = this.getColumnWidth(key, index);
    if (columnWidth) {
      const style = { ...baseStyles, 'min-width': columnWidth, 'max-width': columnWidth, 'width': columnWidth };
      this.memoizedStyles[cacheKey] = style;
      return style;
    }
    this.memoizedStyles[cacheKey] = baseStyles;
    return this.memoizedStyles[cacheKey];
  }
}
