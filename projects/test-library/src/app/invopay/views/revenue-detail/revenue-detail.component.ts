import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, take } from 'rxjs';
import { formatDate } from '@angular/common';

import { TranslateService } from '@ngx-translate/core';
import { RevenueDetail } from '../../interface/revenueDetail';
import { RevenuesListStateService } from '../../services/revenues-list-state.service';
import { RevenueService } from '../../services/revenue.service';
import { LoadingService } from '../../../shared/services/loading.service';

@Component({
  selector: 'app-revenue-detail',
  templateUrl: './revenue-detail.component.html',
  styleUrls: ['./revenue-detail.component.scss']
})
export class RevenueDetailComponent {

    isMobile: boolean=false;
    saleId!: string
    revenue!:RevenueDetail
    title=''
    dataShow!: any
    columnsHeaders:string[]= [
          'installmentNumber',
          'dueDate',
          'amount',
        ];
     titlesMap: Map<string, string> = new Map([
       ['installmentNumber', 'NEW_VAR.INSTALLMENT_NUMBER'],  
       ['amount', 'NEW_VAR.PAYMENT_VALUE'],                   
       ['dueDate', 'IP.BILL_DETAILS.EXPIRY_DATE'],          
      ]);
  
    constructor(private route: ActivatedRoute,
      private readonly stateRevenueService:RevenuesListStateService,
      private readonly service:RevenueService,
      private readonly router: Router,
      private readonly translate: TranslateService ,
      private readonly loadingService : LoadingService  
      ) {}
  
      ngOnInit(): void {
          this.loadingService.setLoadingState(true)
          this.checkScreenSize();
          this.loadTitleMap()
          this.loadRevenueDetail();
      }
      loadTitleMap(){
          this.translate.get([
            'NEW_VAR.INSTALLMENT_NUMBER',
            'NEW_VAR.PAYMENT_VALUE',
            'IP.BILL_DETAILS.EXPIRY_DATE'
          ]).subscribe(translations => {
            this.titlesMap = new Map<string, string>([
              ['installmentNumber', translations['NEW_VAR.INSTALLMENT_NUMBER']],
              ['amount', translations['NEW_VAR.PAYMENT_VALUE']],
              ['dueDate', translations['IP.BILL_DETAILS.EXPIRY_DATE']]
            ]);
          });
  }
  
  
  loadRevenueDetail() {
    this.route.paramMap
      .pipe(
        take(1),
        switchMap(params => {
          this.saleId = String(params.get('id'));
          console.log('ID de venta:', this.saleId);
          return this.service.getRevenue(this.saleId);
        })
      )
      .subscribe({
        next: (res: RevenueDetail) => {
          this.revenue = res;
          console.log('Detalle de venta recibido:', res);

        //mapeo de la respuesta a la vista de datos necesaria
         this.dataShow = {
                         transactionData: this.revenue?.transactionData
                        ? {
                            revenueDate: formatDate(this.revenue.transactionData.revenueDate,'dd/MM/yyyy','en-US') ,
                            currency: this.revenue.transactionData.currency,
                            amount: this.formatNumberToArg( this.revenue.transactionData.amount),
                            paymentProvider: this.revenue.transactionData.paymentProvider,
                            paymentChannel: this.revenue.transactionData.paymentChannel,
                            transactionObservations: this.revenue.transactionData.transactionObservations ?? ''
                          }:null,

                        conciliationData: this.revenue?.conciliationData
                          ? {
                              isConsolidated: this.revenue.conciliationData.isConsolidated?'si':'no',
                              productName: this.revenue.conciliationData.productName,
                              policyNumber: this.revenue.conciliationData.policyNumber,
                              policyAmount: this.revenue.conciliationData.policyAmount,
                              paymentNumber: this.revenue.conciliationData.paymentNumber,
                              paymentValue: this.formatNumberToArg(this.revenue.conciliationData.paymentValue),
                              brokerName: this.revenue.conciliationData.brokerName
                            }:null,
                        policyData: this.revenue?.policyData
                          ? {
                              number: this.revenue.policyData.number,
                              amount: this.formatNumberToArg(this.revenue.policyData.amount),
                              saleDate: this.revenue?.policyData?.saleDate ?  formatDate( this.revenue.policyData.saleDate,'dd/MM/yyyy','en-US'):'-',
                              productName: this.revenue.policyData.productName,
                              premiumAmount: this.formatNumberToArg( this.revenue.policyData.premiumAmount),
                              premiumPaymentInstallments: this.revenue.policyData.premiumPaymentInstallments,
                              premiumPaymentPlan: this.revenue.policyData.premiumPaymentPlan?.map(p => ({
                                installmentNumber: p.installmentNumber,
                                dueDate:formatDate(  p.dueDate,'dd/MM/yyyy','en-US') ,
                                amount: this.formatNumberToArg( p.amount),
                                isPaid: p.isPaid
                              })) ?? []
                            }
                          : null 
                      };
      
          this.title = ' ';
        },
        error: err => {
          console.error('Error cargando detalle', err);
        },
       complete: () => {
        console.log('Filtrado de ventas completado');
         this.loadingService.setLoadingState(false)
      }
      });
    }



      onBackButtonClick() {
        const state = this.stateRevenueService.getState()
        if(state){
        state.enabled=true
        this.stateRevenueService.saveState(state)
        }
        this.router.navigate(['invopay/revenues-list'])
       }
    
      formatNumberToArg(value: number): string {
        if (isNaN(value)) return '0,00';
        return new Intl.NumberFormat('es-AR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value);
        }

      @HostListener('window:resize', ['$event'])
        onResize(event: any) {
          this.checkScreenSize();
        }
      
        private checkScreenSize() {
          this.isMobile = window.innerWidth <= 768;
          if(this.isMobile){
     
          }
        }
      
}
