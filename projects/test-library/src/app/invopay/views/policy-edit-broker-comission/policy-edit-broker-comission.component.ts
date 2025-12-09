import { Component, HostListener } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Installment, PolicyDetailsResponse } from '../../interface/policyData';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificationInsuranceService } from '../../services/notification-insurance.service';
import { PolicyService } from '../../services/policy.service';
import { NumberFormatStyle } from '@angular/common';
import { LoadingService } from '../../../shared/services/loading.service';
import { IpSnackbarService } from '../../services/ip-snackbar.service';
import { PolicyEditModalDialogComponent } from '../../components/policy-edit-modal-dialog/policy-edit-modal-dialog.component';
import { PreviewInstallment } from '../../interface/previewInstallment';

@Component({
  selector: 'app-policy-edit-broker-comission',
  templateUrl: './policy-edit-broker-comission.component.html',
  styleUrls: ['./policy-edit-broker-comission.component.scss']
})
export class PolicyEditBrokerComissionComponent {
 private readonly subscriptions = new Subscription();
  
  policyId: number | null = null;
  policyDetail: PolicyDetailsResponse | null = null;
  dataShow: any
  
  editForm = new FormGroup({
    newBrokerPercentage: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(100)
    ])
  });
  

  

  columnsHeaders = ['installmentNumber', 'dueDate', 'amount', 'brokerCommission', 'status', 'paymentDate'];
  tableDto: any[] = [];
  titlesMap: Map<string, string> | undefined;

  // Calculo del porcentaje actual
  currentBrokerPercentage: number = 0;
  isMobile: boolean=false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly matDialog: MatDialog,
    private readonly translate: TranslateService,
    private readonly loadingService: LoadingService,
    private readonly notificationService: NotificationInsuranceService,
    private readonly policyService: PolicyService,
    private snackbarService: IpSnackbarService
  ) {}

  @HostListener('window:resize', ['$event'])
    onResize(event: any) {
    this.checkScreenSize();
    }
      
    private checkScreenSize() {
      this.isMobile = window.innerWidth <= 768;
    }

    get userType(): string | null {
      return sessionStorage.getItem('userType');
    }
  
  ngOnInit(): void {

    this.loadingService.setLoadingState(true)
    this.checkScreenSize()
    if(!(this.userType == 'ENTERPRISE_USER')){
       
    this.loadTitleMap();
    this.getPolicyIdFromRoute();
    this.loadPolicyData();

    setTimeout(() => {
      window.scrollTo(0, 0);
      
    }, 300);
    }
    
  }

  private parseId(id: string | number): number | null {
    const parsed = typeof id === 'string' ? parseInt(id, 10) : id;
    
    // Validar que sea un número válido y positivo
    if (isNaN(parsed) || parsed <= 0) {
      return null;
    }
    
    return parsed;
  }
  getPolicyIdFromRoute(): void {
  // 1. Prioridad: state de navegación
    const state = history.state;
    if (state && state.id) {
      this.policyId = this.parseId(state.id);
      
      if (this.policyId) {
        console.log('✅ Policy ID obtenido desde state:', this.policyId);
        return;
      }
    }

    // 2. Fallback: route params (por si configuraste la ruta con :id)
    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      this.policyId = this.parseId(paramId);
      
      if (this.policyId) {
        console.log('✅ Policy ID obtenido desde params:', this.policyId);
        return;
      }
    }

    // 3. No se encontró ID válido
    console.error('❌ No se encontró ID de póliza válido');
    //this.router.navigate(['/invopay/policy-list/assurance']);
  
  }

  loadPolicyData(): void {
    if (!this.policyId) return;

    const sub = this.policyService.getPolicyAdminById(this.policyId).subscribe({
      next: (response: PolicyDetailsResponse) => {
        console.log(response)
        this.policyDetail = response;
        this.policyDetail.creationAt= this.formatDate(response.creationAt)
        this.policyDetail.emissionDate=this.formatDate(response.emissionDate)
        this.policyDetail.endDate=this.formatDate(response.endDate)
        this.policyDetail.customer.email = this.policyDetail.customer.email || '-';

        this.calculateCurrentBrokerPercentage();
        this.editForm.controls.newBrokerPercentage.setValue(this.currentBrokerPercentage);
        this.prepareTableData();
        this.loadingService.setLoadingState(false);
      },
      error: (err) => {
        console.error('Error al cargar datos de póliza:', err);
        this.loadingService.setLoadingState(false);
        this.router.navigate(['/invopay/policy-list/assurance']);
      },
      complete:()=>{
        this.loadingService.setLoadingState(false);
      }
    });
    this.subscriptions.add(sub);
  }

  calculateCurrentBrokerPercentage(): void {
    if (!this.policyDetail || !this.policyDetail.installments.length) {
      this.currentBrokerPercentage = 0;
      return;
    }

    // Buscar la primera cuota no pagada para obtener el porcentaje actual
    const unpaidInstallment = this.policyDetail.installments.find(inst => 
      inst.status !== 'PAID' && inst.amount > 0
    );

    if (unpaidInstallment && unpaidInstallment.amount > 0) {
      this.currentBrokerPercentage = (unpaidInstallment.brokerCommission / unpaidInstallment.amount) * 100;
    } else {
      // Si todas están pagadas, tomar la primera
      const firstInstallment = this.policyDetail.installments[0];
      if (firstInstallment && firstInstallment.amount > 0) {
        this.currentBrokerPercentage = (firstInstallment.brokerCommission / firstInstallment.amount) * 100;
      }
    }

    // Redondear a 2 decimales
    this.currentBrokerPercentage = Math.round(this.currentBrokerPercentage * 100) / 100;
  }

  prepareTableData(): void {
    if (!this.policyDetail) return;

    this.tableDto = this.policyDetail.installments.map(installment => ({
      id: installment.installmentNumber,
      installmentNumber: `#${installment.installmentNumber}`,
      dueDate: this.formatDate(installment.dueDate),
      amount: this.formatCurrency(installment.amount, installment.currencyCode || this.policyDetail!.currency),
      brokerCommission: this.formatCurrency(installment.brokerCommission, installment.currencyCode || this.policyDetail!.currency),
      status: this.getStatusLabel(installment.status || 'PENDING'),
      paymentDate: installment.paymentDate ? this.formatDate(installment.paymentDate) : '-',
      realInstallment: installment
    }));
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PAID': 'Pagada',
      'PENDING': 'Pendiente',
      'OVERDUE': 'Atrasada'
    };
    return statusMap[status.toUpperCase()] || status;
  }

  formatCurrency(amount: number, currency?: string): string {
    const curr = currency || this.policyDetail?.currency || '';
    return `${curr} ${this.formatNumberToArg(amount)}`;
  }

  formatNumberToArg(value: number): string {
    if (isNaN(value)) return '0,00';
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy}`;
  }

  onSave(): void {
    if (this.editForm.invalid) {
      return;
    }

    const newPercentage = this.editForm.controls.newBrokerPercentage.value;
    if (newPercentage === null || !this.policyDetail) return;

    // Calcular preview de cuotas
   const previewInstallments = this.calculatePreviewInstallments(newPercentage);

  //  if (previewInstallments.length === 0) {
  //    return;
  //  }

    // Abrir modal de confirmación
   this.openPreviewModal(previewInstallments, newPercentage);
  }

  calculatePreviewInstallments(newPercentage: number): PreviewInstallment[] {
    if (!this.policyDetail) return [];

    return this.policyDetail.installments
      .filter(inst => inst.status !== 'PAID')
      .map(inst => {
        const newCommission = (inst.amount * newPercentage) / 100;
        return {
          installmentNumber: inst.installmentNumber,
          dueDate: this.formatDate(inst.dueDate),
          amount: inst.amount,
          currentCommission: inst.brokerCommission,
          newCommissionPercentage: newPercentage,
          newCommissionAmount: newCommission,
          status: inst.status || 'PENDING'
        };
      });
  }
      

  openPreviewModal(previewInstallments: PreviewInstallment[], newPercentage: number): void {
    const dialogRef = this.matDialog.open(PolicyEditModalDialogComponent, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        previewInstallments,
        policyDetail: this.policyDetail,
        currentPercentage: this.currentBrokerPercentage,
        newPercentage
      },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'confirm') {
        this.saveNewCommission();
      }
    });
  }

  saveNewCommission(): void {
    if (!this.policyId || this.editForm.invalid) return;

    const newPercentage = this.editForm.controls.newBrokerPercentage.value;
    if (newPercentage === null) return;

    this.loadingService.setLoadingState(true);

    const sub = this.policyService
      .updateBrokerCommission(this.policyId, newPercentage)
      .subscribe({
        next: () => {
          console.log("NEXT")
          this.loadingService.setLoadingState(false);
          this.showSuccessModal();
        },
        error: (err) => {
          console.error('Error al actualizar comision:', err);
          this.showErrorModal()
          this.loadingService.setLoadingState(false);

        },
        complete:()=>{
          this.loadingService.setLoadingState(false)
        }
      });
    this.subscriptions.add(sub);
  }

  showSuccessModal(): void {
    this.snackbarService.showSuccessMessage(
          'Operación realizada.', 
          'Éxito'
        );
      

      this.router.navigate(['/invopay/policy-list/assurance']);
  }
  showErrorModal(): void {
    this.snackbarService.  showCustomErrorMessage(
      'Error',
      'Operación fallida'
      ,true
        );
  }

  onCancel(): void {
    this.router.navigate(['/invopay/policy-list/assurance']);
  }

  loadTitleMap(): void {
    const sub = this.translate
      .get([
        'NEW_VAR.INSTALLMENT_NUMBER',
        'NEW_VAR.EXPIRATION',
        'NEW_VAR.AMOUNT',
        'NEW_VAR.BROKER_COMMISSION',
        'NEW_VAR.STATUS',
        'NEW_VAR.PAYMENT_DATE'
      ])
      .subscribe(translations => {
        this.titlesMap = new Map<string, string>([
          ['installmentNumber', translations['NEW_VAR.INSTALLMENT_NUMBER']],
          ['dueDate', translations['NEW_VAR.EXPIRATION']],
          ['amount', translations['NEW_VAR.AMOUNT']],
          ['brokerCommission', translations['NEW_VAR.BROKER_COMMISSION']],
          ['status', translations['NEW_VAR.STATUS']],
          ['paymentDate', translations['NEW_VAR.PAYMENT_DATE']]
        ]);
      });
    this.subscriptions.add(sub);
  }

  get canSave(): boolean {
    return this.editForm.valid && this.policyDetail !== null;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
