import { Component, OnInit } from '@angular/core';
import { LoadingService } from '../../../shared/services/loading.service';
import { PolicyService } from '../../services/policy.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Installment,
  InstallmentBackend,
  PolicyDetailsResponse,
  PolicyTableDetails,
} from '../../interface/policyData';

@Component({
  selector: 'app-policy-details',
  templateUrl: './policy-details.component.html',
  styleUrls: ['./policy-details.component.scss'],
})
export class PolicyDetailsComponent implements OnInit {
  constructor(
    private policyService: PolicyService,
    public loadingService: LoadingService,
    public router: Router
  ) {}

  policyId: number = 0;
  /*policyDetails : any = {
    policyInfo: {
      client: {
        fullName: "Juan Perez",
        email: "juan.perez@example.com"
      },
      broker: {
        fullName: "Maria Gomez",
        email: "maria.gomez@brokerpro.com",
        category: "gold"
      },
      policy: {
        policyNumber: "POL-123456",
        productName: "Premium Complete Insurance",
        creationDate: "2025-01-10",
        emissionDate: "2025-01-12",
        expirationDate: "2026-01-12",
        brokerPremiumValue: 120000,
        installmentsCount: 6
      },
      commissionScheme: {
        schemeName: "Standard Commission 2025",
        percentageUsed: 12.5
      },
      installments: [
        {
          installmentNumber: 1,
          dueDate: "2025-02-12",
          installmentValue: 20000,
          brokerCommission: 2500,
          status: "paid",
          paymentDate: "2025-02-10"
        },
        {
          installmentNumber: 2,
          dueDate: "2025-03-12",
          installmentValue: 20000,
          brokerCommission: 2500,
          status: "pending",
          paymentDate: null
        },
        {
          installmentNumber: 3,
          dueDate: "2025-04-12",
          installmentValue: 20000,
          brokerCommission: 2500,
          status: "overdue",
          paymentDate: null
        }
      ]
    }
  };*/
  policyDetails: PolicyDetailsResponse | null = null;
  tableData: PolicyTableDetails[] = [];
  isUserBroker: boolean = false; //revisar el user

  get userType(): string | null {
    return sessionStorage.getItem('userType');
  }

  ngOnInit() {
    //agarrar el id y settearlo
    this.policyId = history.state?.id ?? 0;

    if (!this.policyId) {
      console.log('ID no encontrado en navigation state');
    }

    this.getPolicyDetails(this.policyId);
  }

  detailedInfoForm: FormGroup = new FormGroup({
    //client
    clientFullName: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ),
    clientEmail: new FormControl({ value: '', disabled: true }, [
      Validators.required,
      Validators.email,
    ]),

    //broker
    brokerFullName: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ),
    brokerEmail: new FormControl({ value: '', disabled: true }, [
      Validators.required,
      Validators.email,
    ]),
    brokerCategory: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ),

    //policy
    policyNumber: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ),
    productName: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ),
    creationDate: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ),
    emissionDate: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ),
    expirationDate: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ),
    brokerPremiumValue: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ),
    installmentsCount: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ),

    //schemes
    commissionSchemeName: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ),
    percentageUsed: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ),
  });

  getPolicyDetails(id: number) {
    this.loadingService.setLoadingState(true);

    if (
      this.userType == 'ENTERPRISE_USER' ||
      this.userType == 'ENTERPRISE_MANAGER'
    ) {
      this.policyService.getPolicyAdminById(id).subscribe({
        next: (response: PolicyDetailsResponse) => {
          console.log('Detalle Policy: ', response);
          this.policyDetails = response;
          this.setFormValues();
          this.setTableData();
          this.loadingService.setLoadingState(false);
        },
        error: () => {
          this.loadingService.setLoadingState(false);
        },
      });
    } else {
      this.policyService.getPolicyBrokerById(id).subscribe({
        next: (response: PolicyDetailsResponse) => {
          console.log('Detalle Policy: ', response);
          this.policyDetails = response;
          this.setFormValues();
          this.setTableData();
          this.loadingService.setLoadingState(false);
        },
        error: () => {
          this.loadingService.setLoadingState(false);
        },
      });
    }
  }

  setFormValues() {
    if (!this.policyDetails) return;

    const fullName = `${this.policyDetails.customer.firstName} ${this.policyDetails.customer.lastName}`;

    this.detailedInfoForm.patchValue({
      //client
      clientFullName: fullName,
      clientEmail: this.policyDetails.customer.email || 'N/A',

      //broker
      brokerFullName: this.policyDetails.broker.username || '',
      brokerEmail: this.policyDetails.broker.userEmail || '',
      brokerCategory: 'N/A', //no viene en el backend

      //policy
      policyNumber: this.policyDetails.policyNumber || '',
      productName: this.policyDetails.name || '',
      creationDate: this.policyDetails.creationAt?.split('T')[0] || '',
      emissionDate: this.policyDetails.emissionDate?.split('T')[0] || '',
      expirationDate: this.policyDetails.endDate?.split('T')[0] || '',
      brokerPremiumValue: `${this.policyDetails.currency} ${Math.round(
        Number(this.policyDetails.amount)
      ).toLocaleString()}`,
      installmentsCount: this.policyDetails.installments.length || '',

      //commission Scheme - ajusta según tu lógica
      commissionSchemeName: 'N/A', //no viene en el backend
      percentageUsed: this.calculateCommissionPercentage()
    });
  }

  setTableData() {
    if (!this.policyDetails?.installments) {
      this.tableData = [];
      return;
    }

    const currency = this.policyDetails.currency;

    this.tableData = this.policyDetails.installments.map(
      (installment: InstallmentBackend): PolicyTableDetails => {
        const isPaid =
          installment.status === 'paid' || installment.paymentDate !== null;

        const formattedAmount = `${currency} ${Math.round(
          Number(installment.amount)
        ).toLocaleString()}`;

        const formattedCommission = isPaid
          ? `${currency} ${Math.round(
              Number(installment.brokerCommission)
            ).toLocaleString()}`
          : '';

        return {
          installmentNumber: installment.installmentNumber,
          installmentValue: formattedAmount,
          dueDate: installment.dueDate?.split('T')[0] || '',
          status: isPaid
            ? 'Pagada'
            : this.isOverdue(installment.dueDate)
            ? 'Atrasada'
            : 'Pendiente',
          brokerCommission: formattedCommission,
          paymentDate:
            isPaid && installment.paymentDate
              ? installment.paymentDate.split('T')[0]
              : '',
        };
      }
    );

    this.loadingService.setLoadingState(false);
  }

  private isOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date();
  }

  private calculateCommissionPercentage(): string {
  if (!this.policyDetails?.installments || this.policyDetails.installments.length === 0) {
    return 'N/A';
  }
  
  const firstInstallment = this.policyDetails.installments[0];
  const percentage = (firstInstallment.brokerCommission / firstInstallment.amount) * 100;
  
  return `${percentage.toFixed(2)}%`;
}

  //Encabezados
  propertyOrder = [
    'dueDate',
    'installmentValue',
    'brokerCommission',
    'status',
    'paymentDate',
  ];

  //Por si queres traducir el encabezado
  keyTranslate = 'IP.POLICY_DETAILS';

  //Acciones de la tabla
  actions: string[] = [''];

  //Acciones de condicion
  actionsIf: any[] = [];

  //Inicializar la tabla
  initTable = false;

  //Si queremos scroll o no
  scroll = true;

  //Cuando se pulsa el boton de detalle le paso el
  // dataField que tiene la informacion del objeto
  onAction(event: any) {
    console.log('Acción recibida:', event);
  }

  //Si seleccionamos items
  onSelectedItemsChange(items: any[]) {
    console.log('Items seleccionados:', items);
  }

  getControl(controlName: string): FormControl {
    return this.detailedInfoForm.get(controlName) as FormControl;
  }

  //Aca irian las nuevas pestañas/secciones
  showPolicy: boolean = true;
  activeSection: string = 'policy';

  showPolicySection() {
    //ocultar las otras pestañas/secciones
    this.showPolicy = true;
  }

  onBackButtonClick() {
    this.router.navigate(['/invopay/policy-list/broker'])
  }
}
