import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { Subscription, switchMap } from 'rxjs';
import { saleDetail } from '../../interface/saleDetail';
import { SalesListStateService } from '../../services/sales-list-state.service';
import { SalesService } from '../../services/sales.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-sales-details',
  templateUrl: './sales-details.component.html',
  styleUrls: ['./sales-details.component.scss']
})
export class SalesDetailsComponent implements OnInit,OnDestroy {

  
  saleId!: string
  sale!:saleDetail
  title=''
  dataShow!:any
  columnsHeaders:string[]= [
        'number',
        'amount',
        'dueDate',
        'state',
        'brokerCommissionPaid',
        'commissionValue',
        'paymentDate'
      ];
   titlesMap: Map<string, string> = new Map([
      ['number', 'Cuota Nro'],
      ['amount', 'Valor'],
      ['dueDate', 'Vencimiento'],
      ['state', 'Estado'],
      ['brokerCommissionPaid', 'Pago comisión broker'],
      ['commissionValue', 'Valor comisión'],
      ['paymentDate', 'Fecha pago']
    ]);
isMobile: any;

  constructor(private route: ActivatedRoute,
    private readonly stateSaleService :SalesListStateService,
    private readonly service:SalesService,
    private readonly router: Router,
    private readonly translate : TranslateService

  ) {}
  ngOnDestroy(): void {
  this.subscriptions.unsubscribe()
  }

  private readonly subscriptions = new Subscription();


    onBackButtonClick() {
      const state = this.stateSaleService.getState()
      if(state){
      state.enabled=true
      this.stateSaleService.saveState(state)
      }
      this.router.navigate(['sales-list'])
    }



  ngOnInit(): void {
        this.checkScreenSize()
        this.loadSaleDetail();
        this.loadTitleMap()
  }

    loadTitleMap() {

        /*    ['number', 'Cuota Nro'],
      ['amount', 'Valor'],
      ['dueDate', 'Vencimiento'],
      ['state', 'Estado'],
      ['brokerCommissionPaid', 'Pago comisión broker'],
      ['commissionValue', 'Valor comisión'],
      ['paymentDate', 'Fecha pago']
    ]);
*/


          const subsTitles = this.translate.get([
            'NEW_VAR.INSTALLMENT_NUMBER',
            'NEW_VAR.PAYMENT_DATE',
            'NEW_VAR.EXPIRATION',
            'NEW_VAR.STATUS',
            'NEW_VAR.PAYMENT_COMMISSION_BROKER',
            'NEW_VAR.POLICY_AMOUNT',
            'NEW_VAR.DATE_PAYMENT'
          ]).subscribe(translations => {
            this.titlesMap = new Map<string, string>([
              ['number', translations['NEW_VAR.INSTALLMENT_NUMBER']],
              ['amount', translations['NEW_VAR.PAYMENT_DATE']],
              ['dueDate', translations['NEW_VAR.EXPIRATION']],
              ['state', translations['NEW_VAR.STATUS']],
              ['brokerCommissionPaid', translations['NEW_VAR.PAYMENT_COMMISSION_BROKER']],
              ['commissionValue', translations['NEW_VAR.POLICY_AMOUNT']],
              ['paymentDate',translations['NEW_VAR.DATE_PAYMENT']]
            ]);
          });
          this.subscriptions.add(subsTitles);
    }

  loadSaleDetail() {
    this.route.paramMap
      .pipe(
        switchMap(params => {
          this.saleId = String(params.get('id'));
          console.log('ID de venta:', this.saleId);
         // const type = this.router.getCurrentNavigation()?.extras.state?.['type'];
           const type = history.state?.['type'];
          console.log('Type capturado:', type);
          //si viene de pending component traemos detalles de una cuota pendiente o vencida
          if(type==='pending-sales-component'){  
            console.log("get by installment")
            return this.service.getSaleByInstallmentId(this.saleId);
          }
          else{
            console.log("get by sale id")
            return this.service.getSaleById(this.saleId);
          }
        })
      )
      .subscribe({
        next: (res: saleDetail) => {
          this.sale = res;
          console.log('Detalle de venta recibido:', res);

        this.dataShow = {
          id: this.sale.id,
          saleDate: formatDate(this.sale.saleDate, 'dd/MM/yyyy', 'en-US'),
          productName: this.sale.productName,
          policyNumber: this.sale.policyData.number,
          policyValue:  this.sale.currency + " "+this.formatNumberToArg(this.sale.policyData.amount),
          premiumValue: this.sale.currency +" "+ this.formatNumberToArg(this.sale.policyData.premiumAmount),
          brokerCommissionPercent: this.calcularPorcentaje(this.sale.amount, this.sale.policyData.amount) + ' %',
          brokerCommissionARS: this.sale.currency+" "+ this.formatNumberToArg(this.sale.amount),
          brokerBusiness: this.sale.brokerNameBussiness,
          brokerName: this.sale.brokerName,
          premiumInstallments: this.sale.premiumPaymentInstallments,
          customerName: this.sale.customer?.fullName,
          customerEmail: this.sale.customer?.email,
          customerPhone: this.sale.customer?.phoneNumber,

          installmentPlan: this.sale?.policyData?.premiumPaymentPlan.map(cuota => ({
            number: cuota.installmentNumber,
            amount: this.sale.currency+" "+ this.formatNumberToArg(cuota.amount),
            dueDate: formatDate(cuota.dueDate, 'dd/MM/yyyy', 'en-US'),
            paid: cuota.isPaid ? 'PAGADA' : 'NO PAGADA',
            state: cuota.isPaid ? 'PAGADA' : 'NO PAGADA',
            brokerCommissionPaid:this.calcularPorcentaje(this.sale.amount, this.sale.policyData.amount) > 0 ? 'SI' : 'NO',
            commissionValue:
              this.sale.currency+" "+
              this.formatNumberToArg(
                this.calcularValorDePorcentaje(
                  cuota.amount,
                  this.calcularPorcentaje(this.sale.amount, this.sale.policyData.amount)
                )
              ),
            paymentDate: cuota.dueDate ? formatDate(cuota.dueDate, 'dd/MM/yyyy', 'en-US') : '-',
          })),
        };

        this.title = 'Detalles de la venta # ' + this.sale.id;
        console.log(this.dataShow);
      },
      error: err => {
        console.error('Error cargando detalle de venta:', err);
      },
    });
}
    calcularValorDePorcentaje(monto: number, porcentaje: number): number {
      const valor = (monto * porcentaje) / 100;
      return +valor.toFixed(2); 
    }
    calcularPorcentaje(valor: number, total: number): number {
      if (total === 0) return 0; // evitar división por cero
      const porcentaje = (valor / total) * 100;
      return +porcentaje.toFixed(2); // redondeado a 2 decimales
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








