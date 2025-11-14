import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CardConfig } from '../../../shared/models/movile-table';
import { PaymentProvider } from '../../interface/paymentEntities';
import { ProvidersService } from '../../services/providers.service';
import { LoadingService } from '../../../shared/services/loading.service';
import IpSelectInputOption from '../../interface/ip-select-input-option';
@Component({
  selector: 'app-payments-entities-list',
  templateUrl: './payments-entities-list.component.html',
  styleUrls: ['./payments-entities-list.component.scss']
})
export class PaymentsEntitiesListComponent implements OnInit,OnDestroy,AfterViewChecked,AfterViewInit {
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  ngOnInit(): void {
    this.initializeMobileCardConfig();
    this.translate.get('IP.PAYMENTS_ENTITIES.TABLE.LOGO').subscribe(() => {
      this.initializeTranslations();
      this.initializeMobileCardConfig();
    });
    this.translate.onLangChange.subscribe(() => {
      this.initializeTranslations();
      this.initializeMobileCardConfig();
    });
    this.loadProviders();
  }
  public readonly loadingService = inject(LoadingService);
  private initializeMobileCardConfig(): void {
    this.mobileCardConfig = {
      headerKey: 'id',
      headerLabel: '#',
      fields: [
        {label:this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.PROVIDEER'),key:'providerName'},
        { label: this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.PAYMENT_CHANNEL'), key: 'channel' },
        { label: this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.ACTIVE'), key: 'active',isAmount: true },
        { label: this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.DESCRIPTION'), key: 'description' }
      ],
      showActionButton: true,
      actionIcon: 'eye'
    };
  }
  ngAfterViewChecked(): void {
    // Logo rendering is now handled by the table component
  }
  
  ngAfterViewInit(): void {
    // Logo rendering is now handled by the table component
  }
  data: any[] = [];
  originalData: any[] = [];
  columns = [
    'logoUrl',
    'providerName',
    'channel',
    'active',
    'description'
  ];
  
  titlesFile = new Map<string, string>();
  tableStyle = 'invopay';
  currentPages: number = 1;
  // Pagination properties
  itemsPerPageControl = new FormControl('25');
  
  // Getter to safely convert form control value to number
  get itemsPerPage(): number {
    return parseInt(this.itemsPerPageControl.value || '25', 10);
  }
  
  pageOptions: IpSelectInputOption[] = [
    { label: '10', value: '10' },
    { label: '25', value: '25' },
    { label: '50', value: '50' },
    { label: '100', value: '100' }
  ];
  paginatedData: any[] = [];
  totalItems: number = 0;
  showPaginator: boolean = true;
  paginatorKey: number = 0;
  mobileCardConfig!: CardConfig;
  subscription=new Subscription();
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly translate = inject(TranslateService);
  private readonly providersService=inject(ProvidersService);
  defaultLogo = './assets/img/mercado-pago.jpeg';

  loadProviders(){
    const sub=this.loadingService.setLoadingState(true);
    this.subscription.add(sub);
    const sub2=this.providersService.getPaymentsEntities().subscribe({
      next:(res)=>{
        console.log(res)
        const providerData= Array.isArray(res) ? res[0] : res;
        this.originalData = providerData.content.map((prov: PaymentProvider) => {
          
               
          return {
            id: prov.id,
            logoUrl: prov.logoUrl && prov.logoUrl.includes('example.com') ? this.defaultLogo : prov.logoUrl,
            providerName: prov.name,
            channel: prov.paymentChannels,
            active: this.isActive(prov.isActive),
            description: prov.description,
            _rawData: prov
            };
          });  
          this.data = [...this.originalData]; 
          this.loadData();    
          const sub3=this.loadingService.setLoadingState(false);
          this.subscription.add(sub3);
      },
      error:(err)=>{
        console.error('Error fetching providers:', err);
        const sub3=this.loadingService.setLoadingState(false);
        this.subscription.add(sub3);
      }
    })
    this.subscription.add(sub2);
  }

 

  /**
   * Pagination
   */
  onPageChange(page: number) {
    this.currentPages = page;
    this.updatePaginatedData();
  }

  updatePaginatedData() {
    const itemsPerPage = parseInt(this.itemsPerPageControl.value || '25', 10);
    const start = (this.currentPages - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    this.paginatedData = this.data.slice(start, end);
  }
  
  loadData(): void {
    this.totalItems = this.data.length;
    // Initialize the form control with the current items per page value
    this.itemsPerPageControl.setValue('25', { emitEvent: false });
    this.updatePaginatedData();
  }

  onTableAction(event: any): void {
    const { event: action, dataField } = event;
    if (action === 'detail') {
      console.log('Ver detalle:', dataField);
    }
  }
  
  onMobileCardAction(item: any): void {
    console.log('Ver detalle:', item);
  }
  
  onItemsPerPageChange(event: any): void {
    const value = event?.value || event; // Handle both event object and direct value
    const newValue = parseInt(value, 10);
    this.itemsPerPageControl.setValue(newValue.toString(), { emitEvent: false });
    this.currentPages = 1;
    this.paginatorKey++;
    this.showPaginator = false;
    setTimeout(() => {
      this.showPaginator = true;
      this.cdr.detectChanges();
    }, 0);
    this.updatePaginatedData();
  }

  private initializeTranslations() {
    this.titlesFile = new Map<string, string>([
      ['logoUrl', this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.LOGO')],
      ['providerName', this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.PROVIDEER')],
      ['channel', this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.PAYMENT_CHANNEL')],
      ['active', this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.ACTIVE')],
      ['description', this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.DESCRIPTION')]
    ]);
    this.cdr.detectChanges();
  }

  isActive(param:boolean): string{
 if(param){
  return this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.YES');
 }else{
  return this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.NO');
}
}
}
