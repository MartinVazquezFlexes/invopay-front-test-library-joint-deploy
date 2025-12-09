import { Component, OnInit, ChangeDetectorRef, inject, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, combineLatest } from 'rxjs';
import { FormControl } from '@angular/forms';
import { GoalsItem } from '../../interface/objective-list.models';
import IpSelectInputOption from '../../interface/ip-select-input-option';
import { LoadingService } from '../../../shared/services/loading.service';

@Component({
  selector: 'app-goals-list',
  templateUrl: './goals-list.component.html',
  styleUrls: ['./goals-list.component.scss']
})
export class GoalsListComponent implements OnInit, OnDestroy {

  config = {
    title: 'IP.GOALS.TITLE',
    columns: ['name', 'period', 'categoryBroker', 'startDate', 'endDate', 'newPolicies', 'newPrimus', 'wallet', 'grade'],
    actions: ['detail', 'edit', 'delete'],
    tableStyle: 'invopay'
  };

  data: GoalsItem[] = [
    {
      id: 1,
      name: 'Meta de Ventas Q1 2024',
      period: 'Q1 2024',
      categoryBroker: 'Premium',
      startDate: '01/01/2024',
      endDate: '31/03/2024',
      newPolicies: 85,
      newPrimus: 92,
      wallet: 78,
      grade: 'Alcanzado',
      status: 'active'
    },
    {
      id: 2,
      name: 'Objetivo de Producción',
      period: 'Q1 2024',
      categoryBroker: 'Estándar',
      startDate: '15/01/2024',
      endDate: '15/04/2024',
      newPolicies: 65,
      newPrimus: 70,
      wallet: 60,
      grade: 'Parcialmente alcanzado',
      status: 'active'
    },
    {
      id: 3,
      name: 'Meta de Crecimiento Q2',
      period: 'Q2 2024',
      categoryBroker: 'Premium',
      startDate: '01/04/2024',
      endDate: '30/06/2024',
      newPolicies: 110,
      newPrimus: 105,
      wallet: 95,
      grade: 'Sobrepasado',
      status: 'active'
    },
    {
      id: 4,
      name: 'Objetivo de Renovación',
      period: 'Q3 2024',
      categoryBroker: 'Básico',
      startDate: '01/07/2024',
      endDate: '30/09/2024',
      newPolicies: 45,
      newPrimus: 50,
      wallet: 40,
      grade: 'No alcanzado',
      status: 'pending'
    },
    {
      id: 5,
      name: 'Meta Anual 2024',
      period: 'Año 2024',
      categoryBroker: 'Premium Plus',
      startDate: '01/01/2024',
      endDate: '31/12/2024',
      newPolicies: 95,
      newPrimus: 88,
      wallet: 90,
      grade: 'Alcanzado',
      status: 'active'
    },
    {
      id: 6,
      name: 'Objetivo de Expansión',
      period: 'Q4 2024',
      categoryBroker: 'Estándar',
      startDate: '01/10/2024',
      endDate: '30/12/2024',
      newPolicies: 75,
      newPrimus: 80,
      wallet: 72,
      grade: 'Parcialmente alcanzado',
      status: 'active'
    }
  ];

  originalData: GoalsItem[] = [];
  columnWidths = {
    'name': '200px',
    'period': '100px',
    'categoryBroker': '120px',
    'startDate': '110px',
    'endDate': '110px',
    'newPolicies': '100px',
    'newPrimus': '100px',
    'wallet': '100px',
    'grade': '120px',
    'actions': '100px'
  };
  
  // Pagination
  itemsPerPageControl = new FormControl('10');
  pageOptions: IpSelectInputOption[] = [
    { label: '10', value: '10' },
    { label: '25', value: '25' },
    { label: '50', value: '50' },
    { label: '100', value: '100' }
  ];

  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);
  public readonly loader=inject(LoadingService);
  subscription = new Subscription();

  titlesFile = new Map<string, string>();
  currentPages: number = 1;
  itemsPerPage: number = 10;
  paginatedData: GoalsItem[] = [];
  totalItems: number = 0;
  showPaginator: boolean = true;

  paginatorKey: number = 0;
  isLoading: boolean = false;

  mobileCardConfig: any;

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.setupTranslations();
    if (this.data && this.data.length > 0) {
      this.loader.setLoadingState(true);
      
      setTimeout(() => {
        this.originalData = [...this.data];
        this.applyCurrentFilters();
      }, 100);
    }
    
    this.itemsPerPageControl.setValue(this.itemsPerPage.toString(), { emitEvent: false });
  }

  private setupTranslations(): void {
    const translationKeys = [
      'IP.GOALS.TABLE.NAME',
      'IP.GOALS.TABLE.PERIOD',
      'IP.GOALS.TABLE.CATEGORY',
      'IP.GOALS.TABLE.START_DATE',
      'IP.GOALS.TABLE.END_DATE',
      'IP.GOALS.TABLE.POLICES',
      'IP.GOALS.TABLE.NEW_PRUIMUM',
      'IP.GOALS.TABLE.WALLET',
      'IP.GOALS.TABLE.GRADE'
    ];

    const translationObservables = translationKeys.map(key => this.translate.get(key));

    this.subscription.add(
      combineLatest(translationObservables).subscribe((translations: string[]) => {
        const titlesMap = new Map<string, string>([
          ['name', translations[0]],
          ['period', translations[1]],
          ['categoryBroker', translations[2]],
          ['startDate', translations[3]],
          ['endDate', translations[4]],
          ['newPolicies', translations[5] + ' (%)'],
          ['newPrimus', translations[6] + ' (%)'],
          ['wallet', translations[7] + ' (%)'],
          ['grade', translations[8]]
        ]);

        this.titlesFile = titlesMap;

        this.mobileCardConfig = {
          headerKey: 'id',
          headerLabel: '#',
          fields: [
            { label: translations[0], key: 'name' },
            { label: translations[1], key: 'period' },
            { label: translations[2], key: 'categoryBroker' },
            { 
              label: translations[3],
              key: 'startDate',
              isDate: true
            },
            { 
              label: translations[4],
              key: 'endDate',
              isDate: true
            },
            { label: translations[5] + ' (%)', key: 'newPolicies' },
            { label: translations[6] + ' (%)', key: 'newPrimus' },
            { label: translations[7] + ' (%)', key: 'wallet' },
            { label: translations[8], key: 'grade' }
          ],
          showActionButton: false
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

  private applyCurrentFilters(): void {
    this.paginatedData = [...this.data];
    this.totalItems = this.data.length;
    this.currentPages = 1;
    this.updatePaginatedData();
    this.loader.setLoadingState(false);
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
    if (action === 'view') {
      console.log('View goal:', dataField);
    } else if (action === 'edit') {
      console.log('Edit goal:', dataField);
    } else if (action === 'delete') {
      console.log('Delete goal:', dataField);
    }
  }

  onMobileCardAction(event: any): void {
    const { item, action } = event;
    if (action === 'view') {
      console.log('View goal:', item);
    } else if (action === 'edit') {
      console.log('Edit goal:', item);
    } else if (action === 'delete') {
      console.log('Delete goal:', item);
    }
  }

  onTableSort(event: any): void {
    const { event: sortDirection, key } = event;

    if (sortDirection === 'clean') {
      this.data = [...this.data];
      this.updatePaginatedData();
      return;
    }

    this.data.sort((a: GoalsItem, b: GoalsItem) => {
      let aValue: any = (a as any)[key];
      let bValue: any = (b as any)[key];

      if (key === 'startDate' || key === 'endDate') {
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

  private parseDateFromString(dateString: string): Date {
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    const [hours, minutes] = timePart ? timePart.split(':').map(Number) : [0, 0];
    return new Date(year, month - 1, day, hours, minutes);
  }
}
