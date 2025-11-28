import { ChangeDetectorRef, Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { map, Subscription } from 'rxjs';
import { CardConfig } from '../../../shared/models/movile-table';
import { PolicyService } from '../../services/policy.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LoadingService } from '../../../shared/services/loading.service';
import { Policy, PolicyResponse } from '../../interface/policyResponse';
import IpSelectInputOption from '../../interface/ip-select-input-option';
import { AuxFiltersService } from '../../services/aux-filters.service';
import { MatDialog } from '@angular/material/dialog';
import { IpModalMobileComponent } from '../../components/ip-modal-mobile/ip-modal-mobile.component';
import { FiltersDialogData } from '../../components/policy-list-filters-modal-dialog/policyListFilterDialogData';
import { PolicyListFiltersModalDialogComponent } from '../../components/policy-list-filters-modal-dialog/policy-list-filters-modal-dialog.component';
import { NotificationInsuranceService } from '../../services/notification-insurance.service';
import { Broker } from '../../interface/broker';

@Component({
  selector: 'app-policy-list',
  templateUrl: './policy-list.component.html',
  styleUrls: ['./policy-list.component.scss']
})
export class PolicyListComponent implements OnInit , OnDestroy{


     userType : 'broker' | 'assurance' = 'assurance';
         private readonly subscriptions = new Subscription();
    isModalOpen: boolean=false
    constructor(
       private readonly policyService: PolicyService,
       private readonly router: Router ,
       private readonly translate: TranslateService,
       private readonly route: ActivatedRoute,  
       private readonly loadinService : LoadingService,
       private readonly auxFiltersService : AuxFiltersService,
       private readonly matDialog : MatDialog,
      private readonly cdr: ChangeDetectorRef


      ) { }

      rowsCombo: IpSelectInputOption[]=[
      { label: '5', value: '5' },
      { label: '10', value: '10' },
      { label: '20', value: '20' },
      { label: '50', value: '50' },
      ]
    
      showFilterModal = false;

      paginatorReload = false;


      onClickFiltredSearchMobile() {
        if (this.isMobile) {
          this.isModalOpen = true
        } 
      }



  onClickOpenMoreFilters() {
    const dialogData: FiltersDialogData = {
      controlsForm: this.controlsForm,
      products: this.products,
      clients: this.clients,
      brokers: this.brokers,
      userType: this.userType,
      maxStart: this.maxStart,
      maxEnd: this.maxEnd,
      minEnd: this.minEnd
    };

  const dialogRef = this.matDialog.open(PolicyListFiltersModalDialogComponent, {
    width: '800px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    data: dialogData,
    disableClose: false, 
    autoFocus: true
  });

  dialogRef.afterClosed().subscribe(result => {
        console.log("close modal")
        console.log(result)
        const dateStartValue = this.controlsForm.controls.dateStart.value;
        const dateEndValue = this.controlsForm.controls.dateEnd.value;
        // Forzar re-renderizado reseteando y volviendo a setear
        this.controlsForm.controls.dateStart.setValue('', { emitEvent: false });
        this.controlsForm.controls.dateEnd.setValue('', { emitEvent: false });
        
        setTimeout(() => {
          this.controlsForm.controls.dateStart.setValue(dateStartValue);
          this.controlsForm.controls.dateEnd.setValue(dateEndValue);
        }, 0);
      if (result?.action === 'search') {
        this.onClickFiltredSearch();
      } else if (result?.action === 'clear') {
        this.onClearFilters('modal');
      }
      // Si result es undefined, el usuario cerro sin hacer nada
    });
  }

  onClearFilters(procedence :string) {

    this.controlsForm.controls.productFilter.setValue('');
    this.controlsForm.controls.clientFilter.setValue('');
    this.controlsForm.controls.brokerFilter.setValue('');
    this.controlsForm.controls.dateStart.setValue('');
    this.controlsForm.controls.dateEnd.setValue('');
    
    this.currentProduct = '';
    this.currentBroker = '';
    this.currentStart = '';
    this.currentEnd = '';
  }




  /**
   * valido minimo un filtro selecc
   */
  hasAtLeastOneFilter(): boolean {
    const form = this.controlsForm
    
    const hasProduct = !!form.controls.productFilter.value;
    const hasClient = !!form.controls.clientFilter.value;
    const hasBroker = !!form.controls.brokerFilter.value;
    const hasDateStart = !!form.controls.dateStart.value;
    const hasDateEnd = !!form.controls.dateEnd.value;
    
    return hasProduct || hasClient || hasBroker || hasDateStart || hasDateEnd;
  }
  get canSearch(): boolean {
  return this.hasAtLeastOneFilter();
  }


    controlsForm = new FormGroup({
      brokerFilter :new FormControl<string>(''),
      productFilter : new FormControl<string>(''),
      rowPaginator: new FormControl<number>(50),
      dateEnd : new FormControl<string>(''),
      dateStart: new FormControl<string>(''),
      clientFilter:new FormControl<string>('')

      });
    
    isMobile: boolean = false;
    showMobileMenuIndex: number|null=null;
  
    policyData: PolicyResponse | null = null;
    policies: Policy[] = [];
    tableDto: any[] = [];
    currentPages=1
  
    filtredData:any[]=[];
    itemsPerpage:number = 20;
    columnsHeaders = ['cliente','producto','nroPoliza','valorPrima','vencimiento'];
      
    brokers: IpSelectInputOption[] = []

    products: IpSelectInputOption[] = [
      { label: 'Seguro de Vida Total', value: 'Seguro de Vida Total' },
      { label: 'Seguro de Hogar Premium', value: 'Seguro de Hogar Premium'},
      { label: 'Seguro Automotor Plus', value: 'Seguro Automotor Plus'},
      { label: 'Seguro de Accidentes Personales', value: 'Seguro de Accidentes Personales'}];
    
    clients: IpSelectInputOption[] = [
      { label: 'Seguro de Vida Total', value: 'Seguro de Vida Total' }
    ];
    
    actions = ['detail','edit'];
    titlesMap: Map<string,string>|undefined;
  
    currentStart:string=''
    maxStart:string = this.formatDate(new  Date())
    maxEnd : string=''
    minEnd : string =''
    currentEnd:string=''
  
    currentProduct:string =''
    currentBroker :string =''
    currentClient:string=''

    configCardMobile: CardConfig = {
      headerKey: '',
      fields: []
    };

   handleCardAction(event: any): void {
      console.log('Evento recibido:', event);
      
      const item = event.item || event;
      const action = event.action || 'detail';
      
      console.log('Acción:', action, 'Item:', item);
      
      if (action === 'detail') {
        const id = item.realSale?.id;
        if (id) {

         // this.router.navigate(['sales-detail', id], { state: { type: 'pending-sales-component' } });
        }
      }
    }
 

    ngOnInit(): void {
      
      
        this.userType = this.route.snapshot.data['type'] || 'assurance';
        console.log(this.userType)
        this.loadinService.setLoadingState(true)
        this.loadTitleMap();
        this.checkScreenSize()
        this.loadControlsSubscriptions()
        this.loadSelects();
       // this.loadPolicies()

        setTimeout(() => {
          window.scrollTo(0, 0);  // Va al top de la página
        }, 300);  // Delay para que el DOM se renderice primero
      
        
       
    }

  loadSelects() {

 if(this.userType==='assurance'){
   this.auxFiltersService.getAuxBrokers().subscribe({
        next: (value: any[]) => {
          console.log("Respuesta brokers:", value);

          this.brokers = value.map((item: any) => ({
            label: item.username,
            value: item.username
          }));
        },
        error: () => {
          console.log("ERROR loading brokers filter");
          this.brokers = [
            { label: 'broker1', value: 'broker1' },
            { label: 'broker2', value: 'broker2' }
          ];
        }
      });
    }

    this.auxFiltersService.getAuxClients().subscribe({
      next: (value: any[]) => {
        console.log("Respuesta clients:", value);

        this.clients = value.map((item: any) => ({
          label: item.username,
          value: item.username
        }));
      },
      error: () => {
        console.log("ERROR loading brokers filter");
        this.clients = [
          { label: 'client1', value: 'client1' },
          { label: 'client2', value: 'client2' }
        ];
      }
    });
    this.auxFiltersService.getAuxProducts().subscribe({
      next: (value: any[]) => {
        console.log("Respuesta products:", value);

        this.products = value.map((item: any) => ({
          label: item.username,
          value: item.username
        }));
      },
      error: () => {
        console.log("ERROR loading brokers filter");
        this.products = [
          { label: 'product1', value: 'product1' },
          { label: 'product1', value: 'product2' }
        ];
      }
    });
      this.loadinService.setLoadingState(false)
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
        
      this.subscriptions.add(
            this.controlsForm.controls.rowPaginator.valueChanges.subscribe(n => {
              if (n) {
                this.itemsPerpage = Number(n);
                this.currentPages = 1;
                this.loadTable(1);
                this.triggerPaginatorReload();  
              }
            })
          );

        this.subscriptions.add(
          this.controlsForm.controls.brokerFilter.valueChanges.subscribe(value => {
           console.log("NEW")
           console.log(value)

            this.currentBroker = value ?? '';
          })
        );

        this.subscriptions.add(
          this.controlsForm.controls.productFilter.valueChanges.subscribe(value => {
            console.log("NEW")
           console.log(value)

            this.currentProduct = value ?? '';
          })
        );

        this.subscriptions.add(
          this.controlsForm.controls.clientFilter.valueChanges.subscribe(value => {
          console.log("NEW")
          console.log(value)

            this.currentClient = value ?? '';
          })
        );
        this.subscriptions.add(
          this.controlsForm.controls.dateStart.valueChanges.subscribe(value => {
            console.log("NEW")
           console.log(value)

            this.currentStart = value ?? '';
          })
        );
       this.subscriptions.add(
          this.controlsForm.controls.dateEnd.valueChanges.subscribe(value => {
            console.log("NEW")
           console.log(value)

            this.currentEnd = value ?? '';
          })
        );
      }

 

  
  
  onApplyFilter(page: number) {
      /*
      console.log("========== APPLY FILTER START ==========");
      console.log("apply filter page " + page);
      console.log("currentStart (raw):", this.currentStart);
      console.log("currentEnd (raw):", this.currentEnd);
      console.log("currentPayChannel:", this.currentPayChannel);
      */
        this.currentPages=page
        if(this.userType==='assurance'){
          this.getPolicyForAssurance(page);
        }
        if(this.userType==='broker'){
          this.getPolicyForBroker(page)
        }

  }


    getPolicyForBroker(page:number){
        let fromNotHour: string | Date = this.currentStart;
        let toNotHour: string | Date = this.currentEnd;
        
        if (this.currentStart && this.currentEnd) {
          
          const from = this.normalizeStart(this.currentStart);
          const to = this.normalizeEnd(this.currentEnd);
          fromNotHour = from;
          toNotHour = to;
        }
        this.policyService.getPoliciesForBroker().pipe(
        map(response => {
          this.policyData = response;
          
          return this.policyData.content.filter((x, index) => {
            const revDate = this.normalizeStart(x.endDate);
            /*
            console.log(`\n--- Registro ${index + 1} ---`);
            console.log("x.revenueDate (raw):", x.revenueDate);
            console.log("revDate (normalized):", revDate);
            console.log("from:", fromNotHour);
            console.log("to:", toNotHour);
            */
            const matchesDate = !this.currentStart || !this.currentEnd || (revDate >= fromNotHour && revDate <= toNotHour);
            
            console.log("matchesDate:", matchesDate);
            console.log("  !this.currentStart:", !this.currentStart);
            console.log("  !this.currentEnd:", !this.currentEnd);
            console.log("  revDate >= fromNotHour:", revDate >= fromNotHour);
            console.log("  revDate <= toNotHour:", revDate <= toNotHour);
            
            const matchesBroker = !this.currentBroker || x.brokerName.toLowerCase() === this.currentBroker.toLowerCase();
            console.log("matchesBroker:", matchesBroker);
            console.log(this.currentBroker+"===" +x.brokerName)
            const matchesProduct = !this.currentProduct|| x.insuranceName.toLowerCase()===this.currentProduct.toLowerCase()
            console.log("matchesProduct:", matchesProduct);
            console.log(this.currentProduct+"===" +x.insuranceName)
            const matchesClient =!this.currentClient|| x.customerName.toLocaleLowerCase()===this.currentClient.toLocaleLowerCase()
            console.log("matchesClient:", matchesClient);
            console.log(this.currentClient+"===" +x.customerName)
            const result = matchesDate && matchesBroker && matchesProduct && matchesClient;
          // console.log("RESULTADO FINAL (pasa filtro?):", result);
            
            console.log("")
            console.log(result)
            if(!result) console.log(x)
            return result;
          });
        })
      ).subscribe(filtered => {
        this.policies = filtered;
        this.currentPages=1
        this.loadTable(1);
        this.isModalOpen = false;
      });
  }


  getPolicyForAssurance(page:number){

  console.log("---------------------getPolicyForAssurance-------------------------------")
        let fromNotHour: string | Date = this.currentStart;
        let toNotHour: string | Date = this.currentEnd;
        if (this.currentStart && this.currentEnd) {
          
          const from = this.normalizeStart(this.currentStart);
          const to = this.normalizeEnd(this.currentEnd);
          fromNotHour = from;
          toNotHour = to;
        }
        this.policyService.getPolicies().pipe(
        map(response => {
          this.policyData = response;
          
          return this.policyData.content.filter((x, index) => {
            const revDate = this.normalizeStart(x.endDate);
            /*
            console.log(`\n--- Registro ${index + 1} ---`);
            console.log("x.revenueDate (raw):", x.revenueDate);
            console.log("revDate (normalized):", revDate);
            console.log("from:", fromNotHour);
            console.log("to:", toNotHour);
            */
            const matchesDate = !this.currentStart || !this.currentEnd || (revDate >= fromNotHour && revDate <= toNotHour);
            console.log("current S Date :",fromNotHour)
            console.log("current E Date :",toNotHour)
            console.log("item Date:",revDate)
            
            console.log("matchesDate:", matchesDate);
            console.log("  !this.currentStart:", !this.currentStart);
            console.log("  !this.currentEnd:", !this.currentEnd);
            console.log("  revDate >= fromNotHour:", revDate >= fromNotHour);
            console.log("  revDate <= toNotHour:", revDate <= toNotHour);
            
            const matchesBroker = !this.currentBroker || x.brokerName.toLowerCase() === this.currentBroker.toLowerCase();
            console.log("matchesBroker:", matchesBroker);
            console.log(this.currentBroker+"===" +x.brokerName)
            const matchesProduct = !this.currentProduct|| x.insuranceName.toLowerCase()===this.currentProduct.toLowerCase()
            console.log("matchesProduct:", matchesProduct);
            console.log(this.currentProduct+"===" +x.insuranceName)
            const matchesClient =!this.currentClient|| x.customerName.toLocaleLowerCase()===this.currentClient.toLocaleLowerCase()
            console.log("matchesClient:", matchesClient);
            console.log(this.currentClient+"===" +x.customerName)
            const result = matchesDate && matchesBroker && matchesProduct && matchesClient;
          // console.log("RESULTADO FINAL (pasa filtro?):", result);
            
            if(result) console.log(x)
              console.log(result)
            return result;
          });
        })
      ).subscribe(filtered => {
        this.policies = filtered;
        this.currentPages=1
        this.loadTable(1);
        this.isModalOpen = false;
      });
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

        //  this.router.navigate(['sales-detail', id], { state: { type: 'pending-sales-component' } });
        this.router.navigate(['/invopay/policy-details'], {
          state: { id: id }
        });

      }
    }
    onSelectedItems(items: any[]) {
      console.log('Selected', items);
    }

    loadPolicies(): void {

     if(this.userType==='assurance'){ 

          var getSalesSub= this.policyService.getPolicies().pipe(
              map(response => {
                console.log("response")
                console.log(response)
                this.policyData = response;
                return this.policyData.content.filter(()=> {
                  return true;
                });
              })
            ).subscribe({
                  next: (filtered) => {
                    this.policies = filtered;
                    this.auxSetInitialValues();
                  },
                  error: (err) => {
                    console.error('Error al filtrar polizas:', err);
                    this.loadinService.setLoadingState(false)
                    
                  },
                  complete: () => {
                    console.log('carga de polizas completada');
                     this.loadinService.setLoadingState(false)
                  }
                }
            )
            this.subscriptions.add(getSalesSub)
      }
      if(this.userType==='broker'){
             var getSalesSub= this.policyService.getPoliciesForBroker().subscribe({
              next: (response: PolicyResponse) => {
                console.log("response")
                console.log(response)
                this.policyData = response;
                this.policies= this.policyData.content
                this.auxSetInitialValues();
              },
              error: (err) => {
                    console.error('Error al filtrar polizas:', err);
                    this.loadinService.setLoadingState(false)
                    
                  },
              complete: () => {
                    console.log('Filtrado de polizas completado');
                    this.loadinService.setLoadingState(false)
                  }
            });
            this.subscriptions.add(getSalesSub)
       }
      }
  

    private triggerPaginatorReload(): void {
        this.paginatorReload = true;
        setTimeout(() => (this.paginatorReload = false));
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
          this.currentPages = 1;  // <-- Agrega esto para sincronizar
  
          setTimeout(() => {
            this.loadTable(1);
          }, 0);
         // this.onApplyFilter(1)
    }


    

    loadTable(pagina:number) {

    console.log("---------------------LOAD TABLE-------------------------------")
      const totalPages = Math.ceil(this.policies.length / this.itemsPerpage);
      console.log("POLICIES LENGTH",this.policies.length)
      console.log("Items x Page",this.itemsPerpage)
      console.log("TOTAL PAGES",totalPages)
      console.log("CURRENT PAGES",this.currentPages)
    
      // Validación: Si la página excede el total, resetea a 1
      if (pagina > totalPages && totalPages > 0) {
        pagina = 1;
        this.currentPages = 1;
      }
      console.log("pagina:"+pagina)
      console.log("itms x pag : "+this.itemsPerpage)
          const itemsPerPage =Number(this.itemsPerpage)
          const startIndex = (pagina-1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          console.log("start :"+startIndex)
          console.log("end :"+endIndex)
          const filteredSales = [...this.policies.slice(startIndex, endIndex)]

          console.log(this.policies)
          console.log(filteredSales)
          this.tableDto = [...filteredSales.map((item, index) => ({
                    id: item.id,
                    vencimiento: item.endDate ? this.formatDateYYYYmmDD(item.endDate) : '-',
                    producto: item.insuranceName ?? '-',
                    corredor: item.brokerName ?? '-',
                    cliente: item.customerName ?? '-',
                    nroPoliza: item.policyNumber ?? '-',
                    valorPoliza: item.amount ? item.currency + " " + this.formatNumberToArg(item.amount) : '-',
                    realSale: item
          }))];
          console.log(this.tableDto)
          this.cdr.detectChanges();
    }
    
  
    onPageChange(pageNumber: number): void {
      console.log(pageNumber)
      this.currentPages=pageNumber
      this.loadTable(pageNumber);
    }
  
  
    toggleMobileMenu(index: number) {
    if (this.showMobileMenuIndex === index) {
          this.showMobileMenuIndex = null; 
      } 
    else {
          this.showMobileMenuIndex = index; 
    }  
    }
    onMobileMenuAction(accion: string, revenue: any) {
      console.log('Action', accion);
      console.log('Card :', revenue);
      const id = revenue.id
      console.log(id)
      if (accion === 'detail') {
        this.router.navigate(['/invopay/policy-details'], {
          state: { id: id }
        });
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
              'IP.ASSIGN-PROJECTS.EXPIRATION',
              'NEW_VAR.PREMIUM_AMOUNT'
            ]).subscribe(translations => {

              this.titlesMap = new Map<string,string>([
                ['cliente', translations['NEW_VAR.CLIENT']],
                ['producto', translations['NEW_VAR.PRODUCT_NAME']],
                ['nroPoliza', translations['NEW_VAR.POLICY_NUMBER']],
                ['vencimiento', translations['IP.ASSIGN-PROJECTS.EXPIRATION']],
                ['valorPrima', translations['NEW_VAR.PREMIUM_AMOUNT']],
              ]);

             this.configCardMobile= {
              headerLabel: '#',
              headerKey: 'id',
              showActionButton: true,
              actions: ['detail','edit'],
              fields: [
                { label: translations['NEW_VAR.CLIENT'], key: 'cliente' }, 
                { label: translations['NEW_VAR.PRODUCT_NAME'], key: 'producto' }, 
                { label: translations['NEW_VAR.POLICY_NUMBER'], key: 'nroPoliza' }, 
                { label: translations['IP.ASSIGN-PROJECTS.EXPIRATION'], key: 'vencimiento' }, 
                { label: translations['NEW_VAR.PREMIUM_AMOUNT'], key: 'valorPrima', isAmount: true }, 
              ]
            }

            if (this.userType === 'assurance') {
                this.columnsHeaders.push('corredor')

                this.titlesMap.set(
                  'corredor',
                  translations['NEW_VAR.BROKER_NAME']
                );
                  // Evitar que se repita el field si ya existe
                const exists = this.configCardMobile.fields.some(f => f.key === 'corredor');
                if (!exists) {
                 this.configCardMobile.fields.push({
                  label: translations['NEW_VAR.BROKER_NAME'],
                  key: 'corredor'
                });
              }
             }

            });
            this.subscriptions.add(subsTitles);
      }
  
  
    formatDate(date: string | Date): string {
      if (typeof date === 'string') {
        return date;
      }
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    }
 
  

  
    ngOnDestroy(): void {
      this.subscriptions.unsubscribe()
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
    
    normalizeStart(date: Date | string): Date {
      let d: Date;
      
      if (typeof date === 'string') {
        const parts = date.split('-');
        d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        d = date;
      }
      
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    }

    normalizeEnd(date: Date | string): Date {
      let d: Date;
      
      if (typeof date === 'string') {
        const parts = date.split('-');
        d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        d = date;
      }
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    }
}
