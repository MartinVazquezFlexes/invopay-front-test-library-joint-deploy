import { Component, Inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { PreviewInstallment } from '../../interface/previewInstallment';
import { PolicyDetailsResponse } from '../../interface/policyData';
import { FormControl, FormGroup } from '@angular/forms';
import IpSelectInputOption from '../../interface/ip-select-input-option';

interface DialogData {
  previewInstallments: PreviewInstallment[];
  policyDetail: PolicyDetailsResponse;
  currentPercentage: number;
  newPercentage: number;
}

@Component({
  selector: 'app-policy-edit-modal-dialog',
  templateUrl: './policy-edit-modal-dialog.component.html',
  styleUrls: ['./policy-edit-modal-dialog.component.scss']
})
export class PolicyEditModalDialogComponent implements OnInit, OnDestroy {
  
  private readonly subscriptions = new Subscription();
  
  isMobile: boolean = false;
  
  // Para app-table
  columnsHeaders = ['installmentNumber', 'dueDate', 'amount', 'commissionPercentage', 'commissionAmount'];
  tableDto: any[] = [];
  titlesMap: Map<string, string> | undefined;

  // Variables para paginación
  currentPages: number = 1;
  itemsPerpage: number = 6;
  paginatorReload: boolean = false;
  displayedInstallments: any[] = []; // Array que se mostrará en la tabla/cards

  // FormGroup para el paginador
  controlsForm = new FormGroup({
    rowPaginator: new FormControl<number>(6)
  });

  // Opciones del combo de filas por página
  rowsCombo: IpSelectInputOption[] = [
    { label: '6', value: '6' },
    { label: '12', value: '12' },
    { label: '18', value: '18' }
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dialogRef: MatDialogRef<PolicyEditModalDialogComponent>,
    private readonly translate: TranslateService
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    this.checkScreenSize();
    this.loadTitleMap();
    this.prepareTableData();
    this.loadControlsSubscriptions();
    this.loadTable(1); // Cargar la primera página
    console.log(this.data)
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  /**
   * Suscripciones a cambios en controles del formulario
   */
  loadControlsSubscriptions(): void {
    const sub = this.controlsForm.controls.rowPaginator.valueChanges.subscribe(n => {
      if (n) {
        this.itemsPerpage = Number(n);
        this.currentPages = 1;
        this.loadTable(1);
        this.triggerPaginatorReload();
      }
    });
    this.subscriptions.add(sub);
  }

  /**
   * Recarga el componente paginador
   */
  private triggerPaginatorReload(): void {
    this.paginatorReload = true;
    setTimeout(() => (this.paginatorReload = false));
  }

  /**
   * Carga las traducciones para los títulos de la tabla
   */
  loadTitleMap(): void {
    const sub = this.translate
      .get([
        'NEW_VAR.INSTALLMENT_NUMBER',
        'NEW_VAR.PAYMENT_DATE',
        'NEW_VAR.AMOUNT_INSTALLMENT',
        'NEW_VAR.NEW_COMMISION_PERCENTAGE',
        'NEW_VAR.NEW_COMMISION_AMOUNT'
      ])
      .subscribe(translations => {
        this.titlesMap = new Map<string, string>([
          ['installmentNumber', translations['NEW_VAR.INSTALLMENT_NUMBER']],
          ['dueDate', translations['NEW_VAR.PAYMENT_DATE']],
          ['amount', translations['NEW_VAR.AMOUNT_INSTALLMENT']],
          ['commissionPercentage', translations['NEW_VAR.NEW_COMMISION_PERCENTAGE']],
          ['commissionAmount', translations['NEW_VAR.NEW_COMMISION_AMOUNT']]
        ]);
      });
    this.subscriptions.add(sub);
  }

  /**
   * Prepara los datos para la tabla (todos los datos)
   */
  prepareTableData(): void {
    this.tableDto = this.data.previewInstallments.map(inst => ({
      id: inst.installmentNumber,
      installmentNumber: inst.installmentNumber,
      dueDate: inst.dueDate,
      amount: this.formatCurrency(inst.amount),
      commissionPercentage: `${inst.newCommissionPercentage}%`,
      commissionAmount: this.formatCurrency(inst.newCommissionAmount),
      realInstallment: inst
    }));
  }

  /**
   * Carga los datos paginados para mostrar
   */
  loadTable(pagina: number): void {
    const totalPages = Math.ceil(this.tableDto.length / this.itemsPerpage);
    
    // Validación: Si la página excede el total, resetea a 1
    if (pagina > totalPages && totalPages > 0) {
      pagina = 1;
      this.currentPages = 1;
    }

    const itemsPerPage = Number(this.itemsPerpage);
    const startIndex = (pagina - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Obtener solo los items de la página actual
    this.displayedInstallments = [...this.tableDto.slice(startIndex, endIndex)];
  }

  /**
   * Maneja el cambio de página
   */
  onPageChange(pageNumber: number): void {
    console.log('Página seleccionada:', pageNumber);
    this.currentPages = pageNumber;
    this.loadTable(pageNumber);
  }

  /**
   * Formatea un monto a moneda argentina
   */
  formatCurrency(amount: number): string {
    const currency = this.data.policyDetail.currency || '';
    return `${currency} ${this.formatNumberToArg(amount)}`;
  }

  /**
   * Formatea número con separadores argentinos
   */
  formatNumberToArg(value: number): string {
    if (isNaN(value)) return '0,00';
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  /**
   * Calcula y formatea la diferencia entre dos valores
   */
  formatDifference(current: number, newValue: number): string {
    const diff = newValue - current;
    const sign = diff > 0 ? '+' : '';
    const formattedDiff = this.formatNumberToArg(Math.abs(diff));
    const currency = this.data.policyDetail.currency || '';
    
    if (diff === 0) {
      return `${currency} 0,00`;
    }
    
    return `${sign}${currency} ${formattedDiff}`;
  }

  /**
   * Calcula el total de comisiones actuales
   */
  calculateTotalCurrent(): number {
    return this.data.previewInstallments.reduce(
      (sum: number, inst: PreviewInstallment) => sum + inst.currentCommission, 
      0
    );
  }

  /**
   * Calcula el total de nuevas comisiones
   */
  calculateTotalNew(): number {
    return this.data.previewInstallments.reduce(
      (sum: number, inst: PreviewInstallment) => sum + inst.newCommissionAmount, 
      0
    );
  }

  /**
   * Cierra el modal sin confirmar
   */
  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Confirma los cambios y cierra el modal
   */
  onConfirm(): void {
    this.dialogRef.close({ action: 'confirm' });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}