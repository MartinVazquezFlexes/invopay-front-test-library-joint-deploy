import { Component, OnInit, ChangeDetectorRef, AfterViewInit, AfterViewChecked, inject, OnDestroy, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, combineLatest } from 'rxjs';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { NotificationItem, NotificationTrayConfig } from '../../interface/notification-tray.models';
import IpSelectInputOption from '../../interface/ip-select-input-option';


export interface BrokerOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-notification-tray',
  templateUrl: './notification-tray.component.html',
  styleUrls: ['./notification-tray.component.scss']
})
export class NotificationTrayComponent implements OnInit, OnChanges, AfterViewInit, AfterViewChecked, OnDestroy {
  @Input() brokerOptions: BrokerOption[] = [];
  @Input() selectedBroker: string = '';
  @Input() config!: NotificationTrayConfig;
  @Input() data: NotificationItem[] = [];
  @Output() viewNotification = new EventEmitter<NotificationItem>();
  @Output() searchPerformed = new EventEmitter<any>();
  @Output() filtersCleared = new EventEmitter<void>();
  @Output() mobileFiltersOpened = new EventEmitter<void>();
  @Output() replyNotification = new EventEmitter<NotificationItem>();


  originalData: NotificationItem[] = [];
    columnWidths = {
    'notificationDate': '200px'
  };
  
  // Form Controls
  answeredControl = new FormControl('');
  entityControl = new FormControl('');
  brokerControl = new FormControl('');
  userInputControl = new FormControl('');
  itemsPerPageControl = new FormControl('10');
  
  // Options for selects
  answeredOptions: IpSelectInputOption[] = [
    { label: '', labelCode: 'IP.NOTIFICATIONS.FILTERS.YES', value: 'si' },
    { label: '', labelCode: 'IP.NOTIFICATIONS.FILTERS.NO', value: 'no' }
  ];
  
  pageOptions: IpSelectInputOption[] = [
    { label: '10', value: '10' },
    { label: '25', value: '25' },
    { label: '50', value: '50' },
    { label: '100', value: '100' }
  ];
  
  answeredPlaceholder = 'IP.NOTIFICATIONS.FILTERS.ANSWERED_PLACEHOLDER';
  showAnsweredPlaceholder = true;
  
  entityOptions: IpSelectInputOption[] = [];

  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  subscription = new Subscription();

  titlesFile = new Map<string, string>();
  currentPages: number = 1;
  itemsPerPage: number = 10;
  paginatedData: NotificationItem[] = [];
  totalItems: number = 0;
  showPaginator: boolean = true;

  showMobileFiltersModal = false;
  selectedAnswered: string | null = null;
  selectedEntity: string = '';
  selectedUser: string = '';

  paginatorKey: number = 0;
  isLoading: boolean = false;

  mobileCardConfig: any;
  hasSearched: boolean = false;
  isClearEnabled: boolean = false;

  get isSearchDisabled(): boolean {
    const isInsuranceTray = this.brokerOptions && this.brokerOptions.length > 0;
    
    if (isInsuranceTray) {
      const allRequiredSelected = this.selectedEntity && this.selectedBroker;
      if (!allRequiredSelected) {
        return true;
      }
    } 
    else {
      const hasAnyFilter = this.selectedAnswered || this.selectedEntity || this.selectedUser;
      if (!hasAnyFilter) {
        return true;
      }
    }
    
    return false;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngAfterViewChecked(): void {
  }

  ngAfterViewInit(): void {
  }

  ngOnInit() {
    this.setupTranslations();
    if (this.data && this.data.length > 0) {
      this.originalData = [...this.data];
      this.applyCurrentFilters();
    }
    
    // Ensure the form control value is in sync with itemsPerPage
    this.itemsPerPageControl.setValue(this.itemsPerPage.toString(), { emitEvent: false });
    
    if (this.config?.entities) {
      this.entityOptions = this.config.entities.map(entity => ({
        value: entity,
        label: entity
      }));
    }
    
   
    this.answeredControl.valueChanges.subscribe(value => {
      this.selectedAnswered = value || null;
    });
    
    this.entityControl.valueChanges.subscribe(value => {
      this.selectedEntity = value || '';
    });
    
    this.brokerControl.valueChanges.subscribe(value => {
      this.selectedBroker = value || '';
    });
    
    this.userInputControl.valueChanges.subscribe(value => {
      this.selectedUser = value || '';
    });
  }

  ngOnChanges(changes: any) {
    if (changes.data && changes.data.currentValue) {
      this.originalData = [...changes.data.currentValue];
      this.applyCurrentFilters();
    }
    if (changes.config && changes.config.currentValue) {
      this.setupTranslations();
    }
  }

  private setupTranslations(): void {
    if (this.config) {
      const translationKeys = [
        this.config.translations.table.date,
        this.config.translations.table.entity,
        this.config.translations.table.broker,
        this.config.translations.table.query,
        ...(this.config.translations.table.answered ? [this.config.translations.table.answered] : [])
      ];

      const filterTranslationKeys = [
        'IP.NOTIFICATIONS.FILTERS.ALL',
        'IP.NOTIFICATIONS.FILTERS.YES',
        'IP.NOTIFICATIONS.FILTERS.NO',
        'IP.NOTIFICATIONS.FILTERS.USER',
        'IP.NOTIFICATIONS.FILTERS.USER_PLACEHOLDER',
        'IP.NOTIFICATIONS.FILTERS.ANSWERED',
        'IP.NOTIFICATIONS.FILTERS.ENTITY',
        'IP.NOTIFICATIONS.FILTERS.SEARCH',
        'IP.NOTIFICATIONS.FILTERS.CLEAR'
      ];

      const allTranslationKeys = [...translationKeys, ...filterTranslationKeys];
      const translationObservables = allTranslationKeys.map(key => this.translate.get(key));

      this.subscription.add(
        combineLatest(translationObservables).subscribe((translations: string[]) => {

          const titlesMap = new Map<string, string>([
            ['notificationDate', translations[0]],
            ['entity', translations[1]],
            ['brokerName', translations[2]],
            ['query', translations[3]]
          ]);

          if (this.config.translations.table.answered) {
            titlesMap.set('answered', translations[4]);
          }

          this.titlesFile = titlesMap;

          this.mobileCardConfig = {
            headerKey: 'id',
            headerLabel: '#',
            fields: [
              { 
                label: translations[0],
                key: 'notificationDate',
                isDate: true
              },
              { label: translations[1], key: 'entity' },
              { label: translations[2], key: 'brokerName' },
              { label: translations[3], key: 'query' },
              ...(this.config.translations.table.answered ? [
                { 
                  label: translations[4], 
                  key: 'answered',
                  isAmount: true
                }
              ] : [])
            ],
            showActionButton: true,
            actions: ['search', 'comment']
          };

          this.cdr.detectChanges();
        })
      );
      this.subscription.add(
        this.translate.onLangChange.subscribe(() => {
          this.setupTranslations();
        })
      );
    }
  }

  private applyCurrentFilters(): void {
    this.paginatedData = [...this.data];
    this.totalItems = this.data.length;
    this.currentPages = 1;
    this.updatePaginatedData();
  }

  onItemsPerPageChange(event: any): void {
    const value = event?.value || event; 
    this.itemsPerPage = parseInt(value, 10);
    this.currentPages = 1;
    this.updatePaginatedData();
  }

  updatePaginatedData() {
    const start = (this.currentPages - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedData = this.data.slice(start, end);
  }

  onPageChange(page: number) {
    this.currentPages = page;
    this.updatePaginatedData();
  }

  onTableAction(event: any): void {
    const { event: action, dataField } = event;
    if (action === 'search') {
      this.onViewNotification(dataField);
    } else if (action === 'comment') {
      this.onReplyNotification(dataField);
    }
  }

  onMobileCardAction(event: any): void {
    const { item, action } = event;
    if (action === 'search') {
      this.onViewNotification(item);
    } else if (action === 'comment') {
      this.onReplyNotification(item);
    }
  }

  onTableSort(event: any): void {
    const { event: sortDirection, key } = event;

    if (sortDirection === 'clean') {
      this.data = [...this.data];
      this.updatePaginatedData();
      return;
    }

    this.data.sort((a: NotificationItem, b: NotificationItem) => {
      let aValue: any = (a as any)[key];
      let bValue: any = (b as any)[key];

      if (key === 'notificationDate') {
        aValue = this.parseDateFromString(aValue);
        bValue = this.parseDateFromString(bValue);
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    this.updatePaginatedData();
  }

  onSearch(): void {
    const filters = {
      answered: this.selectedAnswered,
      entity: this.selectedEntity,
      user: this.selectedBroker || this.selectedUser
    };

    console.log('Search filters:', filters);

    if (this.selectedBroker) {
      this.selectedUser = '';
    } else if (this.selectedUser) {
      this.selectedBroker = '';
    }

    let filteredData = [...this.originalData];

    if (filters.answered) {
      const answerValue = filters.answered === 'si' ? 'si' : 'no';
      filteredData = filteredData.filter(item => item.answered === answerValue);
    }

    if (filters.entity) {
      filteredData = filteredData.filter(item => 
        item.entity.toLowerCase().includes(filters.entity.toLowerCase())
      );
    }

    if (filters.user) {
      filteredData = filteredData.filter(item => 
        (item.brokerName && item.brokerName.toLowerCase().includes(filters.user.toLowerCase())) ||
        (item._rawData?.brokerName && item._rawData.brokerName.toLowerCase().includes(filters.user.toLowerCase()))
      );
    }

    this.data = filteredData;
    this.applyCurrentFilters();
    this.searchPerformed.emit(filters);
    this.hasSearched = true;
    this.isClearEnabled = true;
  }

  onClearFilters(): void {
    this.answeredControl.reset('', { emitEvent: false });
    this.entityControl.reset('', { emitEvent: false });
    this.brokerControl.reset('', { emitEvent: false });
    this.userInputControl.reset('', { emitEvent: false });
    
    this.selectedAnswered = null;
    this.selectedEntity = '';
    this.selectedBroker = '';
    this.selectedUser = '';
    
    this.hasSearched = false;
    this.isClearEnabled = false;
    this.showAnsweredPlaceholder = true;
    
    this.paginatedData = [...this.originalData];
    this.currentPages = 1;
    this.paginatorKey++;
    
    this.filtersCleared.emit();
    this.applyCurrentFilters();
  }

  openMobileFilters(): void {
    this.mobileFiltersOpened.emit();
  }

  closeMobileFilters(): void {
    this.showMobileFiltersModal = false;
  }

  private parseDateFromString(dateString: string): Date {
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }

  private normalizeString(str: string): string {
    return str.normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase()
              .trim();
  }

  onViewNotification(row: NotificationItem): void {
    this.viewNotification.emit(row);
  }

  onReplyNotification(row: NotificationItem): void {
    this.replyNotification.emit(row);
  }
}
export { NotificationTrayConfig, NotificationItem };

