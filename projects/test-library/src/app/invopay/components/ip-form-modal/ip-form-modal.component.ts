import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import ContractResponse from '../../interfaces/ip-contract-response';
import ContractResponseOne from '../../interfaces/ip-contract-response-one';
import CostCenter from '../../interfaces/ip-cost-center';
import CurrencyResponse from '../../interfaces/ip-currency-response';
import PurchaseOrderResponse from '../../interfaces/ip-purchase-order-response';
import SupplierResponse from '../../interfaces/ip-supplier-response';
import { IpCostCenterService } from '../../services/ip-cost-center.service';
import { IpCurrencyService } from '../../services/ip-currency.service';
import { IpFormValidationsService } from '../../services/ip-form-validations.service';
import { IpSupplierService } from '../../services/ip-supplier.service';
import { TranslateService } from '@ngx-translate/core';

type DocumentData = {
  type: string;
  action: string;
  sharedData?: ContractResponse | PurchaseOrderResponse;
  extraData?: ContractResponseOne;
  documentId?: string;
};

@Component({
  selector: 'app-ip-form-modal',
  templateUrl: './ip-form-modal.component.html',
  styleUrls: ['./ip-form-modal.component.scss'],
})
export class IpFormModalComponent implements OnInit {
  @Output() submitClicked = new EventEmitter<any>();
  form!: FormGroup;
  isPurchaseOrder: boolean = false;
  isEdition: boolean = false;
  suppliers: SupplierResponse[] = [];
  costCenters: CostCenter[] = [];
  currencies!: CurrencyResponse[];
  minEndDate!: string;
  title = '';

  get id() {
    return this.form.get('id') as FormControl;
  }
  get description() {
    return this.form.get('description') as FormControl;
  }
  get name() {
    return this.form.get('name') as FormControl;
  }
  get status() {
    return this.form.get('status') as FormControl;
  }
  get startingDate() {
    return this.form.get('startingDate') as FormControl;
  }
  get endingDate() {
    return this.form.get('endingDate') as FormControl;
  }
  get supplierId() {
    return this.form.get('supplierId') as FormControl;
  }
  get costCenterId() {
    return this.form.get('costCenterId') as FormControl;
  }
  get approver() {
    return this.form.get('approver') as FormControl;
  }
  get paymentDescription() {
    return this.form.get('paymentDescription') as FormControl;
  }
  get autoRenewal() {
    return this.form.get('autoRenewal') as FormControl;
  }
  get amount() {
    return this.form.get('amount') as FormControl;
  }
  get currencyId() {
    return this.form.get('currencyId') as FormControl;
  }
  get monthlyRenewal() {
    return this.form.get('monthlyRenewal') as FormControl;
  }

  constructor(
    private fb: FormBuilder,
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<IpFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) private data: DocumentData,
    private ipSupplierService: IpSupplierService,
    private ipCostCenterService: IpCostCenterService,
    private ipFormValidationsService: IpFormValidationsService,
    private ipCurrencyService: IpCurrencyService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.getSuppliers();
    this.getCostCenters();
    const sharedData = this.data.sharedData;
    let supplierIdFormControl = [''];
    let costCenterIdFormControl = ['', Validators.required];
    if (this.data.action === 'edit') {
      this.isEdition = true;
      if (sharedData) {
        if (sharedData.supplierId) {
          supplierIdFormControl = [sharedData.supplierId.toString()];
        }
        if (sharedData.costCenter.id) {
          costCenterIdFormControl = [
            sharedData.costCenter.id.toString(),
            Validators.required,
          ];
        }
      }
    }
    // Form
    this.form = this.fb.group({
      id: [
        this.data.documentId,
        [Validators.required, Validators.maxLength(20)],
      ],
      description: [
        sharedData?.description,
        [Validators.required, Validators.maxLength(50)],
      ],
      name: [sharedData?.name, [Validators.required, Validators.maxLength(30)]],
      status: [
        sharedData ? (sharedData.isActive ? 'ACTIVE' : 'INACTIVE') : '',
        Validators.required,
      ],
      startingDate: [
        sharedData?.startDate,
        [Validators.required, this.ipFormValidationsService.extremeDate],
      ],
      endingDate: [
        sharedData?.finishDate,
        [Validators.required, this.customEndingDateValidator.bind(this)],
      ],
      supplierId: supplierIdFormControl,
      costCenterId: costCenterIdFormControl,
    });
    if (this.data.type === 'purchase-order') {
      this.isPurchaseOrder = true;
    } else {
      const contractData = this.data.extraData;
      this.form.addControl(
        'approver',
        new FormControl(contractData?.approver, Validators.maxLength(30))
      );
      this.form.addControl(
        'paymentDescription',
        new FormControl(
          contractData?.paymentDescription,
          Validators.maxLength(50)
        )
      );
      this.form.addControl(
        'autoRenewal',
        new FormControl(contractData?.autoRenewal)
      );
      this.form.addControl(
        'amount',
        new FormControl(
          contractData?.amount.amount,
          Validators.max(999999999999.99)
        )
      );
      this.form.addControl(
        'currencyId',
        new FormControl(
          contractData?.amount.currency.id ?? '',
          Validators.required
        )
      );
      this.form.addControl(
        'monthlyRenewal',
        new FormControl(contractData?.amount.monthlyRenewal)
      );
    }
    this.getCurrencies();
    this.fieldsOnlyNumbers();
    this.startingDate?.valueChanges.subscribe(() => {
      this.endingDate?.updateValueAndValidity();
    });

    if (this.isEdition) {
      this.onStartDateChange();
    }
    this.title= this.translateService.instant( this.isPurchaseOrder
      ? this.isEdition
        ? "IP.FORM-MODAL.PURCHASE-ORDER.TITLE-EDIT"
        : "IP.FORM-MODAL.PURCHASE-ORDER.TITLE-CREATE"
      : this.isEdition
      ? "IP.FORM-MODAL.ACTIVE-CONTRACT.TITLE-EDIT"
      : "IP.FORM-MODAL.ACTIVE-CONTRACT.TITLE-CREATE")
  }

  getSuppliers() {
    this.ipSupplierService.getSupplierManagers().subscribe({
      next: (value) => {
        this.suppliers = value.content;
      },
      error(err) {
        console.error('Failed to get suppliers. Error: ', err);
      },
    });
  }

  validateFormat(event: any) {
    let inputValue: string;

    if (event.type === 'paste') {
      console.log('Paste');
      inputValue = event.clipboardData.getData('text/plain');
    } else {
      const key = event.keyCode;
      inputValue = String.fromCharCode(key);
    }

    const regex = /^[0-9]*\.?[0-9]*$/;

    if (!regex.test(inputValue)) {
      event.returnValue = false;
      if (event.preventDefault) {
        event.preventDefault();
      }
    }
  }

  getCostCenters() {
    this.ipCostCenterService.getCostCenters().subscribe({
      next: (value) => {
        this.costCenters = value;
      },
      error(err) {
        console.error('Failed to get cost centers. Error: ', err);
      },
    });
  }

  getCurrencies() {
    this.ipCurrencyService.currencies$.subscribe({
      next: (currencies) => {
        if (currencies) {
          this.currencies = currencies;
        }
      },
      error(err) {
        console.error('Failed to get currencies. Error: ', err);
      },
    });
  }

  fieldsOnlyNumbers() {
    this.setupFieldValidation('id');
    this.setupFieldValidation('amount');
  }

  setupFieldValidation(fieldName: string) {
    this.form.get(fieldName)?.valueChanges.subscribe((value) => {
      if (value) {
        const cleanValue = value.replace(/[^0-9]/g, '');
        this.form.patchValue({ [fieldName]: cleanValue }, { emitEvent: false });
      }
    });
  }

  customEndingDateValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    const endingDateObject = new Date(this.formatDate(control.value));
    if (endingDateObject > new Date('2100-12-31T23:59:59')) {
      return { tooFar: true };
    }
    const startingDateControl = control.parent?.get('startingDate');
    if (startingDateControl) {
      const startingDateObject = new Date(
        this.formatDate(startingDateControl.value)
      );
      if (startingDateObject >= endingDateObject) {
        return { dateDifference: true };
      }
    }
    return null;
  }

  formatDate(date: string): string {
    const day = this.datePipe.transform(date, 'dd');
    const month = this.datePipe.transform(date, 'MM');
    const year = this.datePipe.transform(date, 'yyyy');
    const time = this.datePipe.transform(date, 'hh:mm:ss');
    return `${year}-${month}-${day}T${time}`;
  }

  changeIsNumeric(event: Event, field: string) {
    const inputValue = (event.target as HTMLInputElement).value;
    const cleanValue = inputValue.replace(/[^0-9]/g, '');
    this.form.patchValue({ [field]: cleanValue }, { emitEvent: false });
  }

  onStartDateChange() {
    if (this.startingDate && this.startingDate.value) {
      const startDate = new Date(this.startingDate.value);

      startDate.setDate(startDate.getDate() + 1);

      this.minEndDate = startDate.toISOString().split('T')[0];
    }
  }

  onSubmit() {
    this.submitClicked.emit(this.form.value);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
