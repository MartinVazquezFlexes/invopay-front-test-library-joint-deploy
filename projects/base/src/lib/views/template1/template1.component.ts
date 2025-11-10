import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { RevenueTableRow } from '../../interfaces/revenues';
import { PaginationService } from '../../services/pagination.service';
import { RevenuesMapper } from '../../services/revenues.mapper';
import { RevenuesService } from '../../services/revenues.service';

@Component({
  selector: 'lib-template1',
  templateUrl: './template1.component.html',
  styleUrls: ['./template1.component.scss']
})
export class Template1Component {

  revenues: RevenueTableRow[] | null = null;

  propertyOrder: string[] = [];
  keyTranslate: string = ''
  actions: string[] = [];
  pageItems: number = 10;
  currentPage: number = 0
  totalItems: number = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private revenuesService: RevenuesService,
    private paginationService: PaginationService,
    private revenuesMapper: RevenuesMapper,
    //private matDialog: MatDialog,
    //private ipSnackbarService: IpSnackbarService,
    //private translateService: TranslateService
  ) {


  }

  ngOnInit() {
    this.loadRevenues();
    this.buildTableOptions();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFilterClicked() {
  }

  onAction(event: any) {
    const { event: action, dataField } = event;
    switch (action) {
      case 'create':
        this.openCreateRevenueDialog();
        break;
      case 'edit':
        this.openEditRevenueDialog(dataField);
        break;
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page - 1;
    this.loadRevenues();
  }

  private openCreateRevenueDialog() {
  }

  private openEditRevenueDialog(revenueId: string) {
  }

  private buildTableOptions() {
    this.propertyOrder = [
      'revenueDate',
      'revenueAmount',
      'paymentChannel',
      'policyNumber',
      'productName',
      'premiumAmount',
      'brokerName'
    ];
    this.keyTranslate = 'IP.REVENUES.TABLE';
    this.actions = ['edit'];
  }



  private loadRevenues() {
    this.revenuesService.getRevenues(
      this.paginationService.getPageableParams({ page: this.currentPage, size: this.pageItems })
    ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Revenues loaded:', response);
          this.revenues = this.revenuesMapper.mapToRevenueTableRows(response.content);
          this.pageItems = response.size;
          this.currentPage = response.number;
          this.totalItems = response.totalElements;
        },
        error: (error) => {
          console.error('Error loading revenues:', error);
        }
      });

  }

}
