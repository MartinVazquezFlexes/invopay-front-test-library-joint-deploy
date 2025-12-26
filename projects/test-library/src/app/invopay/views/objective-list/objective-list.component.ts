import { Component, OnInit, ChangeDetectorRef, inject, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, combineLatest } from 'rxjs';
import { FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Category, ObjectiveItem, ObjectiveListConfig } from '../../interface/objective-list.models';
import IpSelectInputOption from '../../interface/ip-select-input-option';
import { LoadingService } from '../../../shared/services/loading.service';
import { IpObjectiveService } from '../../services/ip-objective.service';
import { AmountFormatPipe } from '../../../shared/Utils/amount-format-pipe.pipe';

@Component({
  selector: 'app-objective-list',
  templateUrl: './objective-list.component.html',
  styleUrls: ['./objective-list.component.scss']
})
export class ObjectiveListComponent implements OnInit, OnDestroy {

  config: ObjectiveListConfig = {
    title: 'IP.OBJECTIVES.TITLE',
    columns: ['name', 'categoryName', 'startDate', 'endDate'],
    actions: ['detail', 'edit', 'delete'],
    tableStyle: 'invopay'
  };
  category:Category[]=[];
  data: ObjectiveItem[] = [];

  originalData: ObjectiveItem[] = [];
  columnWidths = {
    'name': '250px',
    'categoryName': '150px',
    'startDate': '120px',
    'endDate': '120px',
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
  public readonly loader=inject(LoadingService)
  private readonly objectiveService=inject(IpObjectiveService)
  private readonly datePipe = inject(DatePipe);
 
  subscription = new Subscription();

  titlesFile = new Map<string, string>();
  currentPages: number = 1;
  itemsPerPage: number = 10;
  paginatedData: ObjectiveItem[] = [];
  totalItems: number = 0;
  showPaginator: boolean = true;

  paginatorKey: number = 0;
  isLoading: boolean = false;

  mobileCardConfig: any;

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.loadData()
    this.setupTranslations();
    if (this.data && this.data.length > 0) {
      this.originalData = [...this.data];
      this.applyCurrentFilters();
    }
    
    this.itemsPerPageControl.setValue(this.itemsPerPage.toString(), { emitEvent: false });
  }

  loadData():void{
    const sub1=this.loader.setLoadingState(true)
    const sub=this.objectiveService.getAllObjectives({page:0,size:10,sort:''}).subscribe({
      next:(data)=>{
        console.log(data)
        this.data=data.content;
        this.loadCategories()
        this.isLoading=false;
       this.subscription.add( this.loader.setLoadingState(false))
        this.subscription.add(sub1)
      },
      error:(error)=>{
        this.isLoading=false;
        this.subscription.add( this.loader.setLoadingState(false))
      }
    })
    this.subscription.add(sub)
    
  }

  loadCategories(){
    const sub=this.objectiveService.getAllCategories().subscribe({
      next:(response)=>{
        console.log(response)
        this.category=response
        this.processDataWithCategories()
      },
      error:(error)=>{
        console.log(error)
        this.processDataWithCategories()
      }
    })
    this.subscription.add(sub)
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
      'IP.OBJECTIVES.TABLE.NAME',
      'IP.OBJECTIVES.TABLE.CATEGORY',
      'IP.OBJECTIVES.TABLE.START_DATE',
      'IP.OBJECTIVES.TABLE.END_DATE'
    ];

    const translationObservables = translationKeys.map(key => this.translate.get(key));

    this.subscription.add(
      combineLatest(translationObservables).subscribe((translations: string[]) => {
        const titlesMap = new Map<string, string>([
          ['name', translations[0]],
          ['categoryName', translations[1]],
          ['startDate', translations[2]],
          ['endDate', translations[3]]
        ]);

        this.titlesFile = titlesMap;

        this.mobileCardConfig = {
          headerKey: 'id',
          headerLabel: '#',
          fields: [
            { label: translations[0], key: 'name' },
            { label: translations[1], key: 'categoryName' },
            { 
              label: translations[2],
              key: 'startDate',
              isDate: true
            },
            { 
              label: translations[3],
              key: 'endDate',
              isDate: true
            }
          ],
          showActionButton: true,
          actions: ['detail', 'edit', 'delete'],
          formatDate: this.formatDateForMobile.bind(this)
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
      console.log('View objective:', dataField);
    } else if (action === 'edit') {
      console.log('Edit objective:', dataField);
    } else if (action === 'delete') {
      console.log('Delete objective:', dataField);
    }
  }

  onMobileCardAction(event: any): void {
    const { item, action } = event;
    if (action === 'view') {
      console.log('View objective:', item);
    } else if (action === 'edit') {
      console.log('Edit objective:', item);
    } else if (action === 'delete') {
      console.log('Delete objective:', item);
    }
  }

  onTableSort(event: any): void {
    const { event: sortDirection, key } = event;

    if (sortDirection === 'clean') {
      this.data = [...this.data];
      this.updatePaginatedData();
      return;
    }

    this.data.sort((a: ObjectiveItem, b: ObjectiveItem) => {
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

  formatDateForMobile(dateString: string): string {
    if (!dateString) return '-';
    return this.datePipe.transform(dateString, 'dd/MM/yy') || dateString;
  }

  private parseDateFromString(dateString: string): Date {
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    const [hours, minutes] = timePart ? timePart.split(':').map(Number) : [0, 0];
    return new Date(year, month - 1, day, hours, minutes);
  }
}
