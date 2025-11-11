import { Component, HostListener } from '@angular/core';
import { map, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';
import { RevenueService } from '../../services/revenue.service';
import { RevenuesListStateService } from '../../services/revenues-list-state.service';
import { RevenuesResponse } from '../../interface/revenueResponse';
import { Revenue } from '../../interface/revenue';
import { RevenueListState } from '../../services/revenueListState';
import { LoadingService } from '../../../shared/services/loading.service';
@Component({
  selector: 'app-revenues-list',
  templateUrl: './revenues-list.component.html',
  styleUrls: ['./revenues-list.component.scss']
})
export class RevenuesListComponent {
  constructor(
      private readonly revenueService: RevenueService,
      private readonly router: Router ,
      private readonly stateService: RevenuesListStateService,
      private readonly translate: TranslateService,
      private readonly route : ActivatedRoute,
      private loadingService: LoadingService
      
     ) { }
    showLoader:boolean = false
    nRowsParameter:number = 20;
    isMobile: boolean=false;
    showMobileMenuIndex: number|null=null;
    isModalOpen = false; 

  private readonly subscriptions = new Subscription();


  controlsForm = new FormGroup({
    rowPaginator: new FormControl<number>(20),
    dateEnd: new FormControl<string>('', { nonNullable: true }),      
    dateStart: new FormControl<string>('', { nonNullable: true }),    
    chanelPayment: new FormControl<string>('')
    });

  revenueData: RevenuesResponse | null = null;
  revenues: Revenue[] = [];
  tableRevDto: any[] = [];
  currentPages=1


  filtredData:any[]=[];
  itemsPerpage:number = 1;
  columnsHeaders = ['fecha','moneda','montoRecaudado','proveedorPago','canalPago','consolidada','nroPoliza','producto','montoPrima','broker'];
  actions = ['detail'];
  titlesMap: Map<string,string>|undefined;

  currentStart:string=''
  maxStart:string = this.formatDate(new  Date())
  maxEnd : string=''
  minEnd : string =''
  currentEnd:string=''
  currentPayChannel =''


  paymentChannels = [
  { label: 'Transferencia', value: 'TRANSFER' },
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'Tarjeta', value: 'tarjeta' },
  { label: 'Boleto', value: 'boleto'},
  { label: 'Cheque', value: 'cheque'}
  ];


  ngOnInit(): void {

   console.log('isMobile:', this.isMobile);
   console.log('RevenueListComponent init');
   console.log('controlsForm:', this.controlsForm);

      console.log('RevenueListComponent init ');
      console.log(this.formatDate(new Date()))
      this.loadingService.setLoadingState(true)
      this.nRowsParameter= this.route.snapshot.data['rowsTable'] || 20
      this.checkScreenSize()
      this.loadTitleMap();
      this.loadControlsSubscriptions()
      this.loadRevenues()

      
  }


  loadPreviusState(stateSaved : RevenueListState){
        this.itemsPerpage=stateSaved.itemsXPage
        this.controlsForm.controls.rowPaginator.setValue(this.itemsPerpage)
        this.currentStart=stateSaved.startFilterValue
        this.controlsForm.controls.dateStart.setValue(this.currentStart)
        this.currentEnd=stateSaved.endFilterValue
        this.controlsForm.controls.dateEnd.setValue(this.currentEnd)
        this.currentPages=stateSaved.currentPage
        this.currentPayChannel= stateSaved.chanelPaymentFilterValue
        this.controlsForm.controls.chanelPayment.setValue(this.currentPayChannel)
        this.onApplyFilter(this.currentPages)

            setTimeout(() => {
              window.scrollTo(0, stateSaved.scrollPosition);
              }, 100);
  }

  loadControlsSubscriptions() {
      const rowPaginatorSubscription = this.controlsForm.controls.rowPaginator.valueChanges.subscribe({
        next: (n) => {
          if(n){

            this.itemsPerpage = Number(n);
            this.loadTable(1); 
            this.currentPages = 1;
            console.log("items por pagina",this.itemsPerpage)
            console.log("paginas",this.currentPages)

          }
        }   
      });
      this.subscriptions.add(rowPaginatorSubscription);
    const channelPaymentSubscription =this.controlsForm.controls.chanelPayment.valueChanges.subscribe({
            next: (n) => {
          if(n){
            this.currentPayChannel = this.paymentChannels.find(pc => pc.value === n)?.value||'';
            this.loadTable(1); 
            this.currentPages = 1;
          }
        } 
    })
    this.subscriptions.add(channelPaymentSubscription)

  }
  onEndDateChange(endDate: any) {

        const target = endDate.target as HTMLInputElement;
        const date = new Date(target.value);
        this.currentEnd=this.formatDate(date)
        const endMinus3Months = new Date(date);
        endMinus3Months.setMonth(endMinus3Months.getMonth() - 3);
        
        var endDate1DayLess = new Date()
        endDate1DayLess.setDate(endDate1DayLess.getDate() - 1)
        this.maxStart = this.formatDate(endDate1DayLess)
  }

  onStartDatechange(startDate1: any) {

        console.log(startDate1)
        const target = startDate1.target as HTMLInputElement;
        
        console.log(target.value);  

        // Convertir a Date
        const date = target.value

        this.currentStart= this.formatDate(date)

        const startPlus3Months = new Date(date);
        startPlus3Months.setMonth(startPlus3Months.getMonth() + 3);
        
        const startDatePlus1day =new Date(this.currentStart)
        startDatePlus1day.setDate(startDatePlus1day.getDate() + 1)
        this.minEnd =this.formatDate(startDatePlus1day)

        const now = new Date();


        if(startPlus3Months>now){
          this.maxEnd=this.formatDate(now)
        }
        else{
            this.maxEnd=this.formatDate(startPlus3Months)
        }
        console.log(this.maxEnd)
        
        if(new Date(this.currentEnd)<new Date(this.currentStart)){
          this.currentEnd = ''
          this.controlsForm.controls.dateEnd.setValue('')
        }  
    }


  onApplyFilter(page:number) {
    console.log("apply filter page "+page )

      if (!this.currentStart || !this.currentEnd) return;

        const from = new Date(this.currentStart);
        const to = new Date(this.currentEnd);
        const fromNotHour =new Date(from.getFullYear(), from.getMonth(), from.getDate())
        const toNotHour =new Date(to.getFullYear(), to.getMonth(), to.getDate())
        const chanelPayment = this.currentPayChannel;

        this.revenueService.getRevenues().pipe(
          map(response => {
            this.revenueData = response;
            return this.revenueData.content.filter(x => {
              const revDate = new Date(x.revenueDate);
              const revDateNotHours=new Date(revDate.getFullYear(), revDate.getMonth(), revDate.getDate())
              const matchesDate = revDateNotHours >= from && revDateNotHours <= toNotHour;
              const matchesChannel = !this.currentPayChannel || x.paymentChannel.toLocaleLowerCase() === this.currentPayChannel.toLocaleLowerCase()||this.currentPayChannel=='';
              console.log(this.currentPayChannel)
              console.log(x.paymentChannel)
              console.log(matchesChannel)
              return matchesDate && matchesChannel;
            });
          })
        ).subscribe(filtered => {
          this.revenues = filtered;
          this.loadTable(page);
          this.isModalOpen=false
        });
  }
  
onClearFilters(): void {
  this.controlsForm.reset({
    rowPaginator: this.itemsPerpage, // mantiene el tamaño actual de página
    dateStart: '',
    dateEnd: '',
    chanelPayment: ''
  });

  // Resetear variables internas
  this.currentStart = '';
  this.currentEnd = '';
  this.currentPayChannel = '';
  this.currentPages = 1;

    this.onApplyFilter(1)
    this.isModalOpen = false;

}



  onClickFiltredSearch() {
    this.onApplyFilter(1)
  }

  isValidDate(date: Date|string|null): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  onTableAction(event: { event: string; dataField?: any }) {
    console.log('Action', event);
    console.log('Fila afectada:', event.dataField);
    const id = event.dataField?.realSale.id
    console.log(id)
    if (event.event === 'detail') {
        const state: RevenueListState={
        scrollPosition: window.scrollY,
        startFilterValue: this.currentStart,
        endFilterValue: this.currentEnd,
        currentPage: this.currentPages,
        itemsXPage: this.itemsPerpage,
        chanelPaymentFilterValue: this.currentPayChannel,
        enabled:false
      }
      this.stateService.saveState(state)
          this.router.navigate(['revenue-detail',id]);
    }
  }
  onSelectedItems(items: any[]) {
    console.log('Selected', items);
  }

  loadRevenues(): void {
    var getRevenuesSub= this.revenueService.getRevenues().subscribe({
      next: (response: RevenuesResponse) => {
        this.revenueData = response;
        this.revenues= this.revenueData.content
        const stateSaved = this.stateService.getState()
        if(stateSaved  && stateSaved.enabled){
          this.loadPreviusState(stateSaved)
        }
        else{  
        this.stateService.clearState()
        this.itemsPerpage=this.nRowsParameter;
        this.controlsForm.controls.rowPaginator.setValue(this.itemsPerpage)
        var oneMountAgo = new Date();
        oneMountAgo.setMonth(new Date().getMonth()-1)
        this.currentStart = this.formatDate(oneMountAgo)
        this.currentEnd = this.formatDate(new Date)
        this.controlsForm.controls.dateStart.setValue(this.currentStart)
        this.controlsForm.controls.dateEnd.setValue(this.currentEnd)
        this.loadTable(1)}
      }
      ,
      error: (error) => {
        console.error('Error al cargar las recaudaciones:', error);
      },
      complete:()=>{
        console.log("asssssssssssssssssssssss")
        this.loadingService.setLoadingState(false)
      }
    });
    this.subscriptions.add(getRevenuesSub)
  }

  loadTable(pagina:number) {
    console.log("pagina:"+pagina)
    console.log("itms x pag : "+this.itemsPerpage)

        const itemsPerPage =Number(this.itemsPerpage)
        const startIndex = (pagina-1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        console.log("start :"+startIndex)
        console.log("end :"+endIndex)
        const filteredRevenues = [...this.revenues.slice(startIndex, endIndex)]
        console.log(this.revenues)
        console.log(filteredRevenues)
        this.tableRevDto = [...filteredRevenues.map((item, index) => ({
          fila:index+1,
          id: item.id,
          fecha: this.formatDate2(item.revenueDate),
          moneda:item.currency,
          montoRecaudado: this.formatNumberToArg(item.revenueAmount),
          proveedorPago:item.paymentProvider,
          canalPago:item.paymentChannel,
          consolidada: item.isConsolidated ? 'SI':'NO',
          nroPoliza: item.isConsolidated ? item.policyNumber:'-',
          producto: item.isConsolidated ?  item.productName :'-',
          montoPrima: item.isConsolidated ? this.formatNumberToArg(item.premiumAmount):'-',
          broker: item.isConsolidated ? item.brokerName : '-',
          realSale: item
        }))];

        console.log(this.tableRevDto)
  }

  onPageChange(pageNumber: number): void {
    this.currentPages=pageNumber
    this.loadTable(pageNumber);
  }

  loadTitleMap(){
          this.translate.get([
            'NEW_VAR.PAYMENT_DATE',
            'IP.CURRENCY',
            'NEW_VAR.COLLECTED_AMOUNT',
            'NEW_VAR.PAYMENT_PROVIDER',
            'NEW_VAR.PAYMEN_CHANNEL',
            'NEW_VAR.CONSOLIDATED',
            'NEW_VAR.POLICY_NUMBER',
            'IP.CARD_TABLE.SALES.PRODUCTNAME',
            'IP.CARD_TABLE.SALES.SALEAMOUNT',
            'IP.CARD_TABLE.INVOICE.BROKERFULLNAME'
          ]).subscribe(translations => {
            this.titlesMap = new Map<string, string>([
              ['fecha', translations['NEW_VAR.PAYMENT_DATE']],
              ['moneda', translations['IP.CURRENCY']],
              ['montoRecaudado', translations['NEW_VAR.COLLECTED_AMOUNT']],
              ['proveedorPago', translations['NEW_VAR.PAYMENT_PROVIDER']],
              ['canalPago', translations['NEW_VAR.PAYMEN_CHANNEL']],
              ['consolidada', translations['NEW_VAR.CONSOLIDATED']],
              ['nroPoliza', translations['NEW_VAR.POLICY_NUMBER']],
              ['producto', translations['IP.CARD_TABLE.SALES.PRODUCTNAME']],
              ['montoPrima', translations['IP.CARD_TABLE.SALES.SALEAMOUNT']],
              ['broker', translations['IP.CARD_TABLE.INVOICE.BROKERFULLNAME']],
            ]);
          });
  }
  

  formatDate(date: string | Date): string {
    if (typeof date === 'string') {
      return date;
    }
    return date.toISOString().split('T')[0];
  }

  formatDate2(date: string | Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()

  }

  formatNumberToArg(value: number): string {
      if (isNaN(value)) return '0,00';
      return new Intl.NumberFormat('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
  }

  toggleMobileMenu(index: number) {
    if (this.showMobileMenuIndex === index) {
        this.showMobileMenuIndex = null; // cierra si se vuelve a hacer click
      } else {
        this.showMobileMenuIndex = index; // abre solo ese menú
      }  
    }
  onMobileMenuAction(accion: string, revenue: any) {
    console.log('Action', accion);
    console.log('Card :', revenue);
    const id = revenue.id
    console.log(id)
    if (accion === 'detail') {
          this.router.navigate(['revenue-detail',id]);
    }
  }

   onClickFiltredSearchMobile() {
    if (this.isMobile) {
      this.isModalOpen = true
    } 
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
    if(this.isMobile){
    this.itemsPerpage=20
    this.controlsForm.controls.rowPaginator.setValue(this.itemsPerpage)
    }
  }

  

}





