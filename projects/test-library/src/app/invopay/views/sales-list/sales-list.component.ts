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


    onApplyFilter(page:number) {
      console.log("apply filter page "+page )
    
        let fromNotHour :string|Date =this.currentStart
        let toNotHour :string|Date =this.currentEnd
        if (this.currentStart && this.currentEnd){
           const from = new Date(this.currentStart);
          const to = new Date(this.currentEnd);
         fromNotHour =new Date(from.getFullYear(), from.getMonth(), from.getDate())
         toNotHour =new Date(to.getFullYear(), to.getMonth(), to.getDate())
         toNotHour.setDate(to.getDate() + 1);
         toNotHour.setHours(23, 59, 59, 999);
        }

          this.salesService.getSales().pipe(
            map(response => {
              this.salesData = response;
              return this.salesData.content.filter(x => {
              const saleDate = new Date(x.saleDate);
              const saleDateNotHours=new Date(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate())

              const matchesDate =  !this.currentStart || !this.currentEnd || (saleDateNotHours >= fromNotHour && saleDateNotHours <= toNotHour);
              const matchesProduct = !this.currentProduct || x.productName.toLocaleLowerCase() === this.currentProduct.toLocaleLowerCase();
              const matchesBroker = !this.currentBroker || x.brokerName.toLocaleLowerCase() === this.currentBroker.toLocaleLowerCase();
              //if(!matchesDate){ console.log("NOT MATCHDATE") ;console.log(x); console.log(saleDateNotHours,fromNotHour,toNotHour)}
              if(!matchesBroker){ console.log("NOT BROKER Match") ;console.log(x); console.log(this.currentBroker.toLocaleLowerCase(),x.brokerName.toLowerCase())}
             // if(!matchesProduct){ console.log("NOT PODUCT MATCH") ;console.log(x); console.log(this.currentProduct.toLocaleLowerCase(),x.productName.toLowerCase())}

                return matchesDate && matchesBroker && matchesProduct;
              });
            })
          ).subscribe(filtered => {
            console.log("FILTERED :")
            console.log(filtered)
            this.sales = filtered;
            this.loadTable(page);
          });
    }

  onClickFiltredSearch() {

    this.onApplyFilter(1)
  }
onClearFilters(): void {
    this.controlsForm.patchValue({
      brokerFilter: '',
      productFilter: '',
      rowPaginator: this.itemsPerpage, // mantiene el valor actual del paginador
      dateStart: '',
      dateEnd: ''
    });

    // Limpiar variables internas de filtros
    this.currentBroker = '';
    this.currentProduct = '';
    this.currentStart = '';
    this.currentEnd = '';

    // Limpiar min y max para permitir nueva selección libre
    this.minEnd = '';
    this.maxEnd = this.formatDate(new Date());
    this.maxStart = this.formatDate(new Date());

     this.isModalOpen=false

     console.log('Filtros limpiados correctamente');
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


  loadTitleMa2p(){
      this.titlesMap = new Map<string,string>([
      ['fila', 'IP.SETTLEMENTS.DETAILS.ROW'],
      ['fecha', 'IP.TABLE.PAYMENTS-DONE.CARD.DATE'],
      ['producto', 'IP.CARD_TABLE.SALES.PRODUCTNAME'],
      ['broker', 'IP.NEW-INVOICE.FORM.BROKER'],
      ['cliente', 'NEW_VAR.CLIENT'],
      ['montoPoliza', 'NEW_VAR.POLICY_AMOUNT'],
    ]);
  }
  
  loadTitleMap() {
          const subsTitles = this.translate.get([
            'IP.SETTLEMENTS.DETAILS.ROW',
            'IP.TABLE.PAYMENTS-DONE.CARD.DATE',
            'IP.CARD_TABLE.SALES.PRODUCTNAME',
            'IP.NEW-INVOICE.FORM.BROKER',
            'NEW_VAR.CLIENT',
            'NEW_VAR.POLICY_AMOUNT'
          ]).subscribe(translations => {
            this.titlesMap = new Map<string, string>([
              ['fila', translations['IP.SETTLEMENTS.DETAILS.ROW']],
              ['fecha', translations['IP.TABLE.PAYMENTS-DONE.CARD.DATE']],
              ['producto', translations['IP.CARD_TABLE.SALES.PRODUCTNAME']],
              ['broker', translations['IP.NEW-INVOICE.FORM.BROKER']],
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
  if (!date) return '';

  const d = new Date(date);
  return d.toISOString().split('T')[0]; 

  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()


  }
}


