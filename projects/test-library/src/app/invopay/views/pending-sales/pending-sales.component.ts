import { Component, HostListener, Input } from '@angular/core';
import { map, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup } from '@angular/forms';
import { RevenueService } from '../../services/revenue.service';
import { PendingRevenuesResponse } from '../../interface/revenueResponse';
import { PendingRevenue } from '../../interface/pendingRevenue';
import { LoadingService } from '../../../shared/services/loading.service';

@Component({
  selector: 'app-pending-sales',
  templateUrl: './pending-sales.component.html',
  styleUrls: ['./pending-sales.component.scss']
})
export class PendingSalesComponent {

   @Input() saleType: 'pending' | 'expired' = 'pending';

    

    onClickFiltredSearchMobile() {
      if (this.isMobile) {
        this.isModalOpen = true
      } 
    }
  
    private readonly subscriptions = new Subscription();
    isModalOpen: boolean=false
    constructor(
       private readonly revenueService: RevenueService,
       private readonly router: Router ,
       private readonly translate: TranslateService,
       private readonly route: ActivatedRoute,   
       private readonly loadinService : LoadingService
      ) { }
  
    controlsForm = new FormGroup({
      brokerFilter :new FormControl<string>(''),
      productFilter : new FormControl<string>(''),
      rowPaginator: new FormControl<number>(50),
      dateEnd : new FormControl<string>(''),
      dateStart: new FormControl<string>('')
      });
    
    isMobile: boolean = false;
    showMobileMenuIndex: number|null=null;
  
    salesData: PendingRevenuesResponse | null = null;
    sales: PendingRevenue[] = [];
    tableSalesDto: any[] = [];
    currentPages=1
  
    filtredData:any[]=[];
    itemsPerpage:number = 0;
    columnsHeaders = ['corredor','cliente','producto','nroPoliza','cuota','monedaYmonto','vencimiento'];
    products=['Seguro de Vida Total','Seguro de Hogar Premium','Seguro Automotor Plus','Seguro de Accidentes Personales'];
    brokers= ['Sofía Gómez','María Rodríguez']
  
    actions = ['detail'];
    titlesMap: Map<string,string>|undefined;
  
    currentStart:string=''
    maxStart:string = this.formatDate(new  Date())
    maxEnd : string=''
    minEnd : string =''
    currentEnd:string=''
  
    currentProduct:string =''
    currentBroker :string =''
  
  
  
  
    ngOnInit(): void {
        if (!this.saleType) {
            this.saleType = this.route.snapshot.data['type'] || 'pending';
          }
        this.loadinService.setLoadingState(true)
        this.loadTitleMap();
        this.checkScreenSize()
        this.loadControlsSubscriptions()
        this.loadSales()
    }
  
  /*
    loadPreviusState(stateSaved : SaleListState){
  
  
          this.itemsPerpage=stateSaved.itemsXPage
          this.controlsForm.controls.rowPaginator.setValue(this.itemsPerpage)
          this.currentStart=stateSaved.startFilterValue
          this.controlsForm.controls.dateStart.setValue(this.currentStart)
          this.currentEnd=stateSaved.endFilterValue
          this.controlsForm.controls.dateEnd.setValue(this.currentEnd)
          this.currentPages=stateSaved.currentPage
          this.currentBroker= stateSaved.brokerFitler
          this.controlsForm.controls.brokerFilter.setValue(this.currentBroker)
          this.currentProduct= stateSaved.productFilter
          this.controlsForm.controls.productFilter.setValue(this.currentProduct)
          this.onApplyFilter(this.currentPages)
  
              setTimeout(() => {
                window.scrollTo(0, stateSaved.scrollPosition);
                this.stateService.clearState()
  
               }, 100);
    }
     */
  
    loadControlsSubscriptions() {
        const rowPaginatorSubscription = this.controlsForm.controls.rowPaginator.valueChanges.subscribe({
          next: (n) => {
            if(n){
              this.itemsPerpage = Number(n);
              this.loadTable(1); 
              this.currentPages = 1;
            }
          }   
        });
        this.subscriptions.add(rowPaginatorSubscription);
  
        const brokerFilterSubs = this.controlsForm.controls.brokerFilter.valueChanges.subscribe({
          next: (value) => { 
            if(value){
              console.log('broker')
              console.log(value)
              this.currentBroker = value;
            }
          }
        });
        this.subscriptions.add(brokerFilterSubs)
  
        const  productFitlerSubs = this.controlsForm.controls.productFilter.valueChanges.subscribe({
          next: (value) => { 
            console.log('product')
            console.log(value)
  
            if(value){
              this.currentProduct = value;
            }
          }
        });
        this.subscriptions.add(productFitlerSubs)
  
  }
    onEndDateChange(endDate: any) {
  
        const target = endDate.target as HTMLInputElement;
          
          
          // Convertir a Date
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
  
  /*
      onApplyFilter(page:number) {
        console.log("apply filter page "+page )
  
          if (!this.currentStart || !this.currentEnd) return;
  
            const from = new Date(this.currentStart);
            const to = new Date(this.currentEnd);
            to.setHours(23, 59, 59, 999);
  
            this.salesService.getSales(this.saleType).pipe(
              map(response => {
                this.salesData = response;
                return this.salesData.content.filter(x => {
                const saleDate = new Date(x.saleDate);
                const matchesDate = saleDate >= from && saleDate <= to;
                const matchesProduct = !this.currentProduct || x.productName.toLocaleLowerCase() === this.currentProduct.toLocaleLowerCase();
                const matchesBroker = !this.currentBroker || x.brokerName.toLocaleLowerCase() === this.currentBroker.toLocaleLowerCase();
                  return matchesDate && matchesBroker && matchesProduct;
                });
              })
            ).subscribe(filtered => {
              this.sales = filtered;
              this.loadTable(page);
            });
      }
  

    onClickFiltredSearch() {
      this.onApplyFilter(1)
    }
     */
       

  
    isValidDate(date: Date|string|null): boolean {
      return date instanceof Date && !isNaN(date.getTime());
    }
  
  
    onTableAction(event: { event: string; dataField?: any }) {
      console.log('Action', event);
      console.log('Fila afectada:', event.dataField);
      const id = event.dataField?.realSale.id
      console.log(id)
      if (event.event === 'detail') {
        /*
            const state: SaleListState={
            scrollPosition:window.scrollY,
            startFilterValue: this.currentStart,
            endFilterValue: this.currentEnd,
            productFilter:this.currentProduct,
            brokerFitler:this.currentBroker,
            currentPage:this.currentPages,
            itemsXPage:this.itemsPerpage,
            enabled:false
              }
        this.stateService.saveState(state)
        */

           // this.router.navigate(['sales-detail',id]);
            this.router.navigate(['sales-detail', id], { state: { type: 'pending-sales-component' } });


      }
    }
    onSelectedItems(items: any[]) {
      console.log('Selected', items);
    }



    loadSales(): void {

     if(this.saleType==='pending'){ 
         const end = new Date()
         const start = new Date()
         end.setMonth(end.getMonth()+1)
         const formatedStart= this.formatDateTo00Hours(start)
         const formatedEnd = this.formatDateTo00Hours(end)
         console.log(start.toISOString())
         console.log(end.toISOString())
         console.log(end)
          var getSalesSub= this.revenueService.getPendingRevenues(formatedStart,formatedEnd).pipe(
              map(response => {
                console.log("response")
                console.log(response)
                this.salesData = response;
                return this.salesData.content.filter(x => {
                  // TODO FALTA CAMPO return x.isPaid;
                  return true;
                });
              })
            ).subscribe({
                  next: (filtered) => {
                    this.sales = filtered;
                    this.auxSetInitialValues();
                  },
                  error: (err) => {
                    console.error('Error al filtrar ventas:', err);
                    this.loadinService.setLoadingState(false)
                    
                  },
                  complete: () => {
                    console.log('carga de venta completada');
                     this.loadinService.setLoadingState(false)

                  }
                }
            )
            this.subscriptions.add(getSalesSub)
      }
      if(this.saleType==='expired'){
             var getSalesSub= this.revenueService.getExpiryRevenues().subscribe({
              next: (response: PendingRevenuesResponse) => {
                console.log("response")
                console.log(response)
                this.salesData = response;
                this.sales= this.salesData.content
                this.auxSetInitialValues();
              },
              error: (err) => {
                    console.error('Error al filtrar ventas:', err);
                    this.loadinService.setLoadingState(false)
                    
                  },
              complete: () => {
                    console.log('Filtrado de ventas completado');
                    this.loadinService.setLoadingState(false)
                  }
            });
            this.subscriptions.add(getSalesSub)
       }
      }
  

    auxSetInitialValues(){

          this.itemsPerpage=20;
          this.controlsForm.controls.rowPaginator.setValue(this.itemsPerpage)
          var oneMountAgo = new Date();
          oneMountAgo.setMonth(new Date().getMonth()-1)
          this.currentStart = this.formatDate(oneMountAgo)
          this.currentEnd = this.formatDate(new Date())
          this.controlsForm.controls.dateStart.setValue(this.currentStart)
          this.controlsForm.controls.dateEnd.setValue(this.currentEnd)
          this.loadTable(1);

         // this.onApplyFilter(1)
    }

    loadTable(pagina:number) {
      console.log("pagina:"+pagina)
      console.log("itms x pag : "+this.itemsPerpage)
          const itemsPerPage =Number(this.itemsPerpage)
          const startIndex = (pagina-1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          console.log("start :"+startIndex)
          console.log("end :"+endIndex)
          const filteredSales = [...this.sales.slice(startIndex, endIndex)]
          console.log(this.sales)
          console.log(filteredSales)
          this.tableSalesDto = [...filteredSales.map((item, index) => ({
            id: item.id,
            vencimiento: this.formatDateYYYYmmDD(item.dueDate),
            producto: item.productName,
            corredor: item.brokerName,
            cliente: item.customerName,
            nroPoliza:item.policyNumber,
            cuota:item.installmentNumber,
            monedaYmonto:item.currency+" "+this.formatNumberToArg(item.revenueAmount),
            realSale: item
          }))];
          console.log(this.tableSalesDto)
    }
  
    onPageChange(pageNumber: number): void {
      this.currentPages=pageNumber
      this.loadTable(pageNumber);
    }
  
  
    toggleMobileMenu(index: number) {
    if (this.showMobileMenuIndex === index) {
          this.showMobileMenuIndex = null; 
    } else {
          this.showMobileMenuIndex = index; 
    }  
    }
    
    onMobileMenuAction(accion: string, revenue: any) {
      console.log('Action', accion);
      console.log('Card :', revenue);
      const id = revenue.id
      console.log(id)
    if (accion === 'detail') {
      this.router.navigate(['sales-detail',id]);
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
  
    formatNumberToArg(value: number): string {
        if (isNaN(value)) return '0,00';
        return new Intl.NumberFormat('es-AR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value);
    }
  

  
 
    
    loadTitleMap() {
            const subsTitles = this.translate.get([
              'NEW_VAR.BROKER_NAME',
              'NEW_VAR.CLIENT',
              'NEW_VAR.PRODUCT_NAME',
              'NEW_VAR.POLICY_NUMBER',
              'NEW_VAR.INSTALLMENT_NUMBER',
              'IP.BILL.FIELDS.AMOUNT',
              'IP.ASSIGN-PROJECTS.EXPIRATION',
              'IP.ACCOUNTABILITY-DETAILS.AMOUNT'
            ]).subscribe(translations => {
              this.titlesMap = new Map<string,string>([
                ['corredor', translations['NEW_VAR.BROKER_NAME']],
                ['cliente', translations['NEW_VAR.CLIENT']],
                ['producto', translations['NEW_VAR.PRODUCT_NAME']],
                ['nroPoliza', translations['NEW_VAR.POLICY_NUMBER']],
                ['cuota', translations['NEW_VAR.INSTALLMENT_NUMBER']],
                ['monedaYmonto', translations['IP.ACCOUNTABILITY-DETAILS.AMOUNT']],
                ['vencimiento', translations['IP.ASSIGN-PROJECTS.EXPIRATION']],
              ]);
            });
            this.subscriptions.add(subsTitles);
      }
  
  
    formatDate(date: string | Date): string {
      if (typeof date === 'string') {
        return date;
      }
      return date.toISOString().split('T')[0];
    }
  
    formatDate2(date: string | Date): string {
      if (typeof date === 'string') {
        return date.replace('T', ' ');
      }
      const iso = date.toISOString();
      return iso.replace('T', ' ');
    }
    formatDateArg(date: string | Date): string {
      let dateObj: Date;
      
      if (typeof date === 'string') {
        dateObj = new Date(date);
      } else {
        dateObj = date;
      }
      
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      const seconds = String(dateObj.getSeconds()).padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }
  
    getTodayDate(): string {
      return new Date().toISOString().split('T')[0];
    }
  
    ngOnDestroy(): void {
      this.subscriptions.unsubscribe()
    }

    formatDateTo00Hours(date:Date){
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}T00:00:00`;
    }
    formatDateYYYYmmDD(dateParam: string | Date){
      let date: Date;
      
      if (typeof dateParam === 'string') {
        date = new Date(dateParam);
      } else {
        date = dateParam;
      }
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`
      ;
    }
}
