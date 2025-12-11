import { ChangeDetectorRef, Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { map, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { SalesService } from '../../services/sales.service';
import { SalesListStateService } from '../../services/sales-list-state.service';
import { SalesResponse } from '../../interface/salesResponse';
import { Sale } from '../../interface/sale';
import { SaleListState } from '../../interface/saleListState';
import { LoadingService } from '../../../shared/services/loading.service';
import IpSelectInputOption from '../../interface/ip-select-input-option';

@Component({
  selector: 'app-sales-list',
  templateUrl: './sales-list.component.html',
  styleUrls: ['./sales-list.component.scss']
})
export class SalesListComponent implements OnInit , OnDestroy {

selectedTab: string='all';
   onClickFiltredSearchMobile() {
    if (this.isMobile) {
      this.isModalOpen = true
    } 
  }

  private readonly subscriptions = new Subscription();
  isModalOpen: boolean=false
  constructor(
     private readonly salesService: SalesService,
     private readonly router: Router ,
     private readonly stateService: SalesListStateService,
     private readonly translate: TranslateService   ,
     private readonly loadingService : LoadingService
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

  salesData: SalesResponse | null = null;
  sales: Sale[] = [];
  tableSalesDto: any[] = [];
  currentPages=1

  filtredData:any[]=[];
  itemsPerpage:number = 0;
  columnsHeaders = ['fila','fecha','producto','broker','cliente','montoPoliza'];

  products: IpSelectInputOption[] = [
  { label: 'Seguro de Vida Total', value: 'Seguro de Vida Total' },
  { label: 'Seguro de Hogar Premium', value: 'Seguro de Hogar Premium'},
  { label: 'Seguro Automotor Plus', value: 'Seguro Automotor Plus'},
  { label: 'Seguro de Accidentes Personales', value: 'Seguro de Accidentes Personales'}];



  brokers: IpSelectInputOption[] = [
  { label: 'Sofía Gómez', value: 'Sofía Gómez' },
  { label: 'María Rodríguez', value: 'María Rodríguez'}];

  rowsCombo: IpSelectInputOption[]=[
  { label: '5', value: '5' },
  { label: '10', value: '10' },
  { label: '20', value: '20' },
  { label: '50', value: '50' },
  ]


  actions = ['detail'];
  titlesMap: Map<string,string>|undefined;

  currentStart:string=''
  maxStart:string = this.formatDate(new  Date())
  maxEnd : string=this.formatDate(new  Date())
  minEnd : string =''
  currentEnd:string=''

  currentProduct:string =''
  currentBroker :string =''




  ngOnInit(): void {
    //  this.controlsForm.controls.dateEnd.disable()
      this.loadingService.setLoadingState(true)
      this.loadTitleMap();
      this.checkScreenSize()
      this.loadControlsSubscriptions()
      this.loadSales()
  }


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

        if(!date){
        //  this.controlsForm.controls.dateEnd.disable()
        }
        else{
        //  this.controlsForm.controls.dateEnd.enable()
        }

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


onApplyFilter(page: number) {
  console.log("=== INICIO FILTRO ===");
  console.log("currentStart:", this.currentStart);
  console.log("currentEnd:", this.currentEnd);
   console.log("=== FILTRO APLICADO ===");
  console.log("currentStart RAW:", this.currentStart, "tipo:", typeof this.currentStart);
  console.log("currentEnd RAW:", this.currentEnd, "tipo:", typeof this.currentEnd);

  this.salesService.getSales().pipe(
    map(response => {
      this.salesData = response;
      return this.salesData.content.filter(x => {
        // Normalizar la fecha de venta a medianoche UTC
        const saleDate = new Date(x.saleDate);
        const saleDateOnly = Date.UTC(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate());

        if (this.currentStart && this.currentEnd) {
          // Parsear las fechas del filtro en UTC
          const [startYear, startMonth, startDay] = this.currentStart.split('-').map(Number);
          const [endYear, endMonth, endDay] = this.currentEnd.split('-').map(Number);
          
          const startDateOnly = Date.UTC(startYear, startMonth - 1, startDay);
          const endDateOnly = Date.UTC(endYear, endMonth - 1, endDay);
          
          console.log("---");
          console.log("Sale:", x.saleDate, "→ UTC:", saleDateOnly);
          console.log("Start:", this.currentStart, "→ UTC:", startDateOnly);
          console.log("End:", this.currentEnd, "→ UTC:", endDateOnly);
          console.log("Match:", saleDateOnly >= startDateOnly && saleDateOnly <= endDateOnly);
          
          const matchesDate = saleDateOnly >= startDateOnly && saleDateOnly <= endDateOnly;
          
          if (!matchesDate) {
            return false;
          }
        }

        const matchesProduct = !this.currentProduct || 
          x.productName.toLowerCase() === this.currentProduct.toLowerCase();
        const matchesBroker = !this.currentBroker || 
          x.brokerName.toLowerCase() === this.currentBroker.toLowerCase();

        return matchesProduct && matchesBroker;
      });
    })
  ).subscribe(filtered => {
    console.log("FILTERED TOTAL:", filtered.length);
    this.sales = filtered;
    this.loadTable(page);
  });
}

onClickFiltredSearch() {

    this.onApplyFilter(1)
}

onClearFilters(): void {
   const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

  const endStr = this.formatDate(today);
  const startStr = this.formatDate(oneMonthAgo);

  this.controlsForm.patchValue({
    brokerFilter: '',
    productFilter: '',
    rowPaginator: this.itemsPerpage,
    dateStart: startStr,
    dateEnd: endStr
  });

  // Seteo variables internas
  this.currentBroker = '';
  this.currentProduct = '';
  this.currentStart = startStr;
  this.currentEnd = endStr;

  // Reset de rangos
  this.minEnd = this.formatDate(new Date(startStr));
  this.maxEnd = endStr;
  this.maxStart = endStr;

  this.isModalOpen = false;

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
          this.router.navigate(['sales-detail',id]);
    }
  }
  onSelectedItems(items: any[]) {
    console.log('Selected', items);
  }

  loadSales(): void {
   var getSalesSub= this.salesService.getSales().subscribe({
      next: (response: SalesResponse) => {
        this.salesData = response;
        this.sales= this.salesData.content
       
      const stateSaved = this.stateService.getState()
      if(stateSaved && stateSaved.enabled===true){
        this.loadPreviusState(stateSaved)
      }
      else{  
        this.stateService.clearState()
        this.itemsPerpage=20;
        this.controlsForm.controls.rowPaginator.setValue(this.itemsPerpage)
        var oneMountAgo = new Date();
        oneMountAgo.setMonth(new Date().getMonth()-1)
        this.currentStart = this.formatDate(oneMountAgo)
        this.currentEnd = this.formatDate(new Date())
        this.controlsForm.controls.dateStart.setValue(this.currentStart)
        this.controlsForm.controls.dateEnd.setValue(this.currentEnd)
        this.onApplyFilter(1)
      }
      },
      error: (error) => {
        console.error('Error al cargar ventas:', error);
        this.loadingService.setLoadingState(false)
      },

      complete:()=>{
        this.loadingService.setLoadingState(false)
      }
    });
    this.subscriptions.add(getSalesSub)
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
          id:  item.id,
          fila: startIndex+index + 1, 
          fecha: this.formatDate3(item.saleDate),
          producto: item.productName,
          broker: item.brokerName,
          cliente: item.customerName,
          montoPoliza:item.currency+" "+this.formatNumberToArg(item.policyAmount),
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
            'IP.SETTLEMENTS.DETAILS.ROW',
            'NEW_VAR.PAYMENT_DATE',
            'NEW_VAR.PRODUCT_NAME',
            'NEW_VAR.BROKER_NAME',
            'NEW_VAR.CLIENT',
            'NEW_VAR.POLICY_AMOUNT'
          ]).subscribe(translations => {
            this.titlesMap = new Map<string, string>([
              ['fila', translations['IP.SETTLEMENTS.DETAILS.ROW']],
              ['fecha', translations['NEW_VAR.PAYMENT_DATE']],
              ['producto', translations['NEW_VAR.PRODUCT_NAME']],
              ['broker', translations['NEW_VAR.BROKER_NAME']],
              ['cliente', translations['NEW_VAR.CLIENT']],
              ['montoPoliza', translations['NEW_VAR.POLICY_AMOUNT']],
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

    formatDate3(date: string | Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year}`;
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()


  }
}


