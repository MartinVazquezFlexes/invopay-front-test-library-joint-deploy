import { Component, OnInit, ChangeDetectorRef, inject, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, combineLatest } from 'rxjs';
import { FormControl } from '@angular/forms';
import { IpGoalItem } from '../../interface/ip-goals-response';
import { Category } from '../../interface/objective-list.models';
import IpSelectInputOption from '../../interface/ip-select-input-option';
import { LoadingService } from '../../../shared/services/loading.service';
import { IpGoalsService } from '../../services/ip-goals.service';
import { IpObjectiveService } from '../../services/ip-objective.service';

@Component({
  selector: 'app-goals-list',
  templateUrl: './goals-list.component.html',
  styleUrls: ['./goals-list.component.scss']
})
export class GoalsListComponent implements OnInit, OnDestroy {

  config = {
    title: 'IP.GOALS.TITLE',
    columns: ['name', 'period', 'categoryName', 'startDate', 'endDate', 'newPoliciesPercentage', 'newPremiumsPercentage', 'portfolioGrowthPercentage', 'degreeOfGoalName'],
    actions: ['detail', 'edit', 'delete'],
    tableStyle: 'invopay'
  };

  data: IpGoalItem[] = [];
  category: Category[] = [];

  originalData: IpGoalItem[] = [];
  columnWidths = {
    'name': '200px',
    'period': '100px',
    'categoryName': '120px',
    'startDate': '110px',
    'endDate': '110px',
    'newPoliciesPercentage': '100px',
    'newPremiumsPercentage': '100px',
    'portfolioGrowthPercentage': '100px',
    'degreeOfGoalName': '120px',
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
  private readonly goalsService=inject(IpGoalsService);
  private readonly objectiveService=inject(IpObjectiveService);
  subscription = new Subscription();

  titlesFile = new Map<string, string>();
  currentPages: number = 1;
  itemsPerPage: number = 10;
  paginatedData: IpGoalItem[] = [];
  totalItems: number = 0;
  showPaginator: boolean = true;

  paginatorKey: number = 0;
  isLoading: boolean = false;

  mobileCardConfig: any;

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.loadData();
    this.setupTranslations();
    this.itemsPerPageControl.setValue(this.itemsPerPage.toString(), { emitEvent: false });
  }

  loadData(): void {
    const sub1 = this.loader.setLoadingState(true);
    const sub = this.goalsService.getAllGoals({page: 0, size: 10, sort: ''}).subscribe({
      next: (data) => {
        console.log(data);
        this.data = data.content;
        this.loadCategories();
        this.isLoading = false;
        this.subscription.add(this.loader.setLoadingState(false));
        this.subscription.add(sub1);
      },
      error: (error) => {
        this.isLoading = false;
        this.subscription.add(this.loader.setLoadingState(false));
      }
    });
    this.subscription.add(sub);
  }

  loadCategories(): void {
    const sub = this.objectiveService.getAllCategories().subscribe({
      next: (response) => {
        console.log(response);
        this.category = response;
        this.processDataWithCategories();
      },
      error: (error) => {
        console.log(error);
        this.processDataWithCategories();
      }
    });
    this.subscription.add(sub);
  }

  private processDataWithCategories(): void {
    this.data = this.data.map(item => ({
      ...item,
      categoryName: this.getCategoryName(item.incentiveCategoryId)
    }));
    
    this.originalData = [...this.data];
    this.applyCurrentFilters();
  }

  private getCategoryName(categoryId: number): string {
    const category = this.category.find(cat => cat.id === categoryId);
    return category ? category.name : '-';
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
          ['categoryName', translations[2]],
          ['startDate', translations[3]],
          ['endDate', translations[4]],
          ['newPoliciesPercentage', translations[5] + ' (%)'],
          ['newPremiumsPercentage', translations[6] + ' (%)'],
          ['portfolioGrowthPercentage', translations[7] + ' (%)'],
          ['degreeOfGoalName', translations[8]]
        ]);

        this.titlesFile = titlesMap;

        this.mobileCardConfig = {
          headerKey: 'id',
          headerLabel: '#',
          fields: [
            { label: translations[0], key: 'name' },
            { label: translations[1], key: 'period' },
            { label: translations[2], key: 'categoryName' },
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
            { label: translations[5] + ' (%)', key: 'newPoliciesPercentage' },
            { label: translations[6] + ' (%)', key: 'newPremiumsPercentage' },
            { label: translations[7] + ' (%)', key: 'portfolioGrowthPercentage' },
            { label: translations[8], key: 'degreeOfGoalName' }
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

    this.data.sort((a: IpGoalItem, b: IpGoalItem) => {
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
