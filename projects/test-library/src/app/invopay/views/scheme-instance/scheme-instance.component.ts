import { Router } from '@angular/router';
import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { IpSnackbarService } from '../../services/ip-snackbar.service';
import { SchemeService } from './../../services/scheme.service';
import { ProductService } from '../../services/product.service';
import { PolicyService } from '../../services/policy.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { PaginatedResponse, CommissionSchemeInstance } from '../../interface/scheme';
import { SelectOption, Policy } from '../../interface/create-scheme-instance';
import IpSelectInputOption from '../../interface/ip-select-input-option';

type TableActionEvent = {
  event: string;
  key?: string;
  dataField?: any;
};

@Component({
  selector: 'app-scheme-instance',
  templateUrl: './scheme-instance.component.html',
  styleUrls: ['./scheme-instance.component.scss']
})
export class SchemeInstanceComponent implements OnInit {

  schemes: CommissionSchemeInstance[] = [];

  tableProperties = [
    'name',
    'schemaType',
    'scope',
    'commissionPercentage',
    'isActiveText'
  ];

  titlesFile = new Map<string, string>();
  private readonly translationKeys = {
    name: 'IP.COMMISSIONS.SCHEME-INSTANCE.TABLE.HEADERS.NAME',
    schemaType: 'IP.COMMISSIONS.SCHEME-INSTANCE.TABLE.HEADERS.SCHEME_TYPE',
    scope: 'IP.COMMISSIONS.SCHEME-INSTANCE.TABLE.HEADERS.RULE_SCOPE',
    commissionPercentage: 'IP.COMMISSIONS.SCHEME-INSTANCE.TABLE.HEADERS.PREMIUM_PERCENTAGE',
    isActiveText: 'IP.COMMISSIONS.SCHEME-INSTANCE.TABLE.HEADERS.IS_ACTIVE_TEXT'
  };

  pageIndex = 0;
  pageSize = 10;
  total = 0;

  policiesPageIndex: number = 0; // Índice base 0
  policiesPageSize: number = 5;

  mobilePageIndex = 0;
  private readonly mobilePageSize = 10;
  private lastDesktopPageIndex = 0;
  private lastDesktopPageSize = 10;
  isHandset = false;

  paginatorReload = false;
  itemsPerPageControl = new FormControl('10');

  pageOptions: IpSelectInputOption[] = [
    { value: '10', label: '10' },
    { value: '15', label: '15' },
    { value: '20', label: '20' },
    { value: '25', label: '25' },
  ];

  isViewModalOpen = false;
  isCreateModalOpen = false;
  isEditModalOpen = false;

  createForm!: FormGroup;
  editForm!: FormGroup;

  selectedScheme: CommissionSchemeInstance | null = null;

  createBusy = false;
  editBusy = false;

  schemeOptions: SelectOption[] = [];
  scopeOptions: SelectOption[] = [];
  incentiveCategoryOptions: SelectOption[] = [];
  yesNoOptions: SelectOption[] = [{ label: 'Sí', value: true }, { label: 'No', value: false }];

  schemaTypes = ['PERCENTAGE', 'FIXED', 'PERCENTAGE_PRODUCT_BROKER'];
  scopeTypes = ['GENERAL', 'BROKER', 'PRODUCT', 'BROKER_PRODUCT'];

  allPolicies: any[] = [];

  isPolicyModalOpen = false;
  isAllPoliciesSelected = false;

  policySearchTerm = '';
  policySelectedBroker: any = null;
  policySearchResults: any[] = [];
  tempSelectedPolicies: any[] = [];
  brokerOptions: SelectOption[] = [];
  productsOptions: SelectOption[] = [];

  policyTitlesFile = new Map<string, string>([
    ['policyNumber', 'Número de Póliza'],
    ['brokerName', 'Corredor'],
    ['amount', 'Monto']
  ]);

  private originalSchemes: CommissionSchemeInstance[] = [];
  openMenuId: number | null = null;
  @ViewChildren('menuRef') menuRefs!: QueryList<ElementRef<HTMLElement>>;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private breakpoint: BreakpointObserver,
    private productService: ProductService,
    private policyService: PolicyService,
    private schemeService: SchemeService,
    public loadingService: LoadingService,
    private translate: TranslateService,
    private snackbarService: IpSnackbarService
  ) { }

  ngOnInit(): void {
    this.updateTableHeaders();

    this.translate.onLangChange.subscribe(() => {
      this.updateTableHeaders();
    });
    this.breakpoint.observe(['(max-width: 768px)']).subscribe(state => {
      const enteringHandset = !!state.matches;

      if (enteringHandset === this.isHandset && this.schemes.length > 0) return;

      this.isHandset = enteringHandset;

      if (this.isHandset) {
        this.lastDesktopPageIndex = this.pageIndex;
        this.lastDesktopPageSize = this.pageSize;
        this.mobilePageIndex = 0;
        this.rebuildMobileSlice();
        this.initForm();
        this.loadCatalogData();
      } else {
        this.pageIndex = this.lastDesktopPageIndex;
        this.pageSize = this.lastDesktopPageSize;
        this.rebuildDesktopSlice();
        this.initForm();
        this.loadCatalogData();
      }
    });
  }

  /**
   * Carga de datos MOCKEADA simulando comportamiento de API
   */
  private loadPage(index: number, size: number): void {
    this.loadingService.setLoadingState(true);

    this.schemeService.getInstances(index, size).subscribe({
      next: (response) => {
        // Transformamos los datos (boolean -> texto) antes de asignarlos
        this.schemes = this.mapSchemeDisplayData(response.content);

        // Creamos la copia de seguridad (patrón inmutabilidad)
        this.originalSchemes = [...this.schemes];

        // Actualizamos variables de paginación
        this.total = response.totalElements;
        this.pageIndex = response.number;
        this.pageSize = response.size;

        this.loadingService.setLoadingState(false);
      },
      error: (err) => {
        console.error("Error al cargar esquemas de comisiones:", err);
        this.loadingService.setLoadingState(false);
        // Aquí podrías agregar un toast/snackbar de error si tenés uno global
      }
    });
  }

  onSort(event: any): void {
    if (event?.key !== 'name') return;

    const direction = event.event;

    // Si limpia el orden, volvemos a la copia original de la página actual
    if (direction === 'clean') {
      this.schemes = [...this.originalSchemes];
      return;
    }

    // Ordenamiento Cliente (Solo de la página actual)
    // NOTA: Con API real, aquí deberíamos llamar a loadPage pasando parámetros de sort
    const sorted = [...this.schemes].sort((a, b) => {
      const aVal = a.name.toLowerCase();
      const bVal = b.name.toLowerCase();
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    this.schemes = sorted;
  }

  onRowAction(evt: TableActionEvent) {
    if (!evt.dataField) return;

    const scheme = evt.dataField as CommissionSchemeInstance;

    if (evt.event === 'detail') {
      this.router.navigate(['/invopay/instance-detail', scheme.id]);
      console.log('Ver detalles:', scheme);
    }

    else if (evt.event === 'edit') {
      console.log('Editar:', scheme);
    }
  }

  onAddNewScheme() {
    // 1. Reseteamos el formulario siempre
    this.createForm.reset({ 
      isActive: true, 
      hasIncentiveCategory: false,
      commissionPercentage: 0,   
      schemaType: null,          
      scope: null  
    });
    // Limpiamos los arrays por si quedaron sucios
    (this.createForm.get('policies') as FormArray).clear();

    // 2. Verificamos si ya tenemos los catálogos cargados (Caché simple)
    if (this.schemeOptions.length > 0) {
      this.isCreateModalOpen = true;
      return;
    }

    // 3. Si no hay datos, los cargamos
    this.loadCatalogData();
  }

  onPageChange(page1Based: number) {
    const zeroBasedIndex = Math.max(0, page1Based - 1);
    this.pageIndex = zeroBasedIndex;
    this.loadPage(zeroBasedIndex, this.pageSize);
  }

  onPageSizeChange(newSize: number | string): void {
    const parsed = typeof newSize === 'string' ? parseInt(newSize, 10) : newSize;
    const size = Number.isFinite(parsed) && parsed > 0 ? parsed : this.pageSize;

    this.pageSize = size;
    this.pageIndex = 0;

    this.loadPage(0, this.pageSize);
    this.triggerPaginatorReload();
  }

  onMobilePageChange(page1Based: number) {
    this.mobilePageIndex = Math.max(0, page1Based - 1);
    this.rebuildMobileSlice();
  }

  private triggerPaginatorReload(): void {
    this.paginatorReload = true;
    setTimeout(() => (this.paginatorReload = false));
  }

  openViewModal(scheme: CommissionSchemeInstance): void {
    this.selectedScheme = scheme;
    this.isViewModalOpen = true;
  }

  onViewModalClose(): void {
    this.isViewModalOpen = false;
    this.selectedScheme = null;
  }

  openCreateModal(): void {
    this.createForm.reset({ isActive: true, commissionPercentage: 0 });
    this.isCreateModalOpen = true;
  }

  onCreateModalClose(): void {
    this.isCreateModalOpen = false;
  }

  onConfirmCreate() {
    // 1. Validaciones básicas
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      this.snackbarService.showCustomErrorMessage('Formulario inválido', 'Complete los campos.');
      return;
    }

    // 2. Activar Loading
    this.createBusy = true;
    this.loadingService.setLoadingState(true);

    // 3. Obtener valores del formulario
    const formVal = this.createForm.getRawValue();

    console.group('🔍 DEBUG FORMULARIO');
    console.log('Percentage en Formulario:', formVal.percentage, typeof formVal.percentage);
    console.log('HasIncentive (Valor):', formVal.hasIncentiveCategory, typeof formVal.hasIncentiveCategory);
    console.log('IncentiveCategoryID:', formVal.incentiveCategoryId, typeof formVal.incentiveCategoryId);
    console.groupEnd();

    // --- LÓGICA ESPECIAL PARA INCENTIVOS (Array de Objeto) ---
    let incentiveCategoriesPayload: any[] = [];
    const hasIncentive = String(formVal.hasIncentiveCategory) === 'true'; 
    const incentiveId = formVal.incentiveCategoryId;

    if (hasIncentive && incentiveId) {
      // Usamos '==' (doble igual) para encontrar el ID aunque uno sea string y el otro number
      const selectedOption = this.incentiveCategoryOptions.find(opt => opt.value == incentiveId);
      
      if (selectedOption) {
         incentiveCategoriesPayload = [{
          incentiveCategoryId: Number(incentiveId), // Aseguramos que se vaya como número
          commissionPercentage: formVal.percentage
        }];
      } else {
        console.warn('⚠️ No se encontró el nombre de la categoría para el ID:', incentiveId);
      }
    }

    // 4. Construir el Payload Final
    const payload = {
      name: formVal.name,
      schemaType: formVal.schemaType,
      scope: formVal.scope,
      commissionSchemeId: 7,
      commissionPercentage: formVal.percentage,
      isActive: formVal.isActive,

      // Enviamos el array construido arriba (puede estar vacío o tener 1 objeto)
      hasIncentiveCategory: hasIncentive,
      hasIncentiveScheme: hasIncentive,
      incentiveCategories: incentiveCategoriesPayload,

      // --- TRANSFORMACIÓN A IDs (Listas) ---
      insurancePolicyIds: (formVal.policies || []).map((p: any) => p.id),
      productIds: formVal.products || [],
      brokerIds: formVal.brokers || [] 
    };

    console.log('Payload Instancia:', payload); // Debug para verificar estructura

    // 5. Llamada al Servicio (POST)
    this.schemeService.createSchemeInstance(payload).subscribe({
      next: (res) => {
        console.log('Instancia creada:', res);
        this.loadingService.setLoadingState(false);
        this.createBusy = false;
        this.onCreateModalClose();
        this.snackbarService.showSuccessMessage(
          'La instancia ha sido creada correctamente.', 
          'Éxito'
        );
      },
      error: (err) => {
        console.error('Error al crear:', err);
        this.loadingService.setLoadingState(false);
        this.createBusy = false;
        const msg = err.error?.message || 'No se pudo guardar la instancia.';
        this.snackbarService.showCustomErrorMessage(
          'Error al crear', 
          msg
        );
      }
    });
  }

  openEditModal(scheme: CommissionSchemeInstance): void {
    this.selectedScheme = scheme;
    this.editForm.patchValue({
      id: scheme.id,
      name: scheme.name,
      schemaType: scheme.schemaType,
      scope: scheme.scope,
      commissionPercentage: scheme.commissionPercentage,
      isActive: scheme.isActive
    });
    this.isEditModalOpen = true;
  }

  onEditModalClose(): void {
    this.isEditModalOpen = false;
    this.selectedScheme = null;
  }

  onConfirmEdit(): void {
    if (this.editForm.invalid) return;

    this.editBusy = true;
    console.log('Payload Editar:', this.editForm.value);

    setTimeout(() => {
      this.editBusy = false;
      this.onEditModalClose();
      this.loadPage(this.pageIndex, this.pageSize);
    }, 1000);
  }

  private mapSchemeDisplayData(data: CommissionSchemeInstance[]): CommissionSchemeInstance[] {
    return data.map(item => ({
      ...item,
      isActiveText: item.isActive ? 'Si' : 'No'
    }));
  }

  private rebuildMobileSlice(): void {
    this.loadPage(this.mobilePageIndex, this.mobilePageSize);
  }

  private rebuildDesktopSlice(): void {
    this.loadPage(this.pageIndex, this.pageSize);
  }

  toggleMenu(id: number): void {
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.openMenuId === null) return;

    const container = this.menuRefs
      ?.find(ref => ref.nativeElement.getAttribute('data-id') === String(this.openMenuId))
      ?.nativeElement;

    if (!container || !container.contains(event.target as Node)) {
      this.openMenuId = null;
    }
  }

  onMobileAction(action: string, scheme: any): void {
    this.openMenuId = null;
    this.onRowAction({ event: action, dataField: scheme });
  }
  private updateTableHeaders(): void {
    const keysToTranslate = Object.values(this.translationKeys);

    this.translate.get(keysToTranslate).subscribe(translations => {
      this.titlesFile = new Map<string, string>([
        ['name', translations[this.translationKeys.name]],
        ['schemaType', translations[this.translationKeys.schemaType]],
        ['scope', translations[this.translationKeys.scope]],
        ['commissionPercentage', translations[this.translationKeys.commissionPercentage]],
        ['isActiveText', translations[this.translationKeys.isActiveText]]
      ]);
    });
  }

  private initForm() {
    this.createForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(30)]],
      schemaType: [null, Validators.required],
      scope: [null, Validators.required],
      percentage: [null, [Validators.required, Validators.min(0)]],
      isActive: [true],

      // Lógica de Incentivos
      hasIncentiveCategory: [false],
      incentiveCategoryId: [null],
      brokers: [[]], // Array de IDs para el select múltiple

      // Listas de Selección
      products: [[]],
      policies: this.fb.array([])
    });

    // Listener: Limpiar validación de incentivos
    this.createForm.get('hasIncentiveCategory')?.valueChanges.subscribe(val => {
      const catCtrl = this.createForm.get('incentiveCategoryId');
      if (val) catCtrl?.setValidators(Validators.required);
      else { catCtrl?.clearValidators(); catCtrl?.setValue(null); }
      catCtrl?.updateValueAndValidity();
    });

    // Listener: Limpiar Arrays al cambiar Scope
    this.createForm.get('scope')?.valueChanges.subscribe(scope => {
       
       // --- CORRECCIÓN ---
       // Aseguramos que scope sea un string. Si es null, usamos ''
       const safeScope = scope || ''; 
       // ------------------

       const brokersCtrl = this.createForm.get('brokers');
       const productsArray = this.createForm.get('products');
       const policiesArray = this.createForm.get('policies') as FormArray;

       // 1. Lógica Brokers (Select Múltiple)
       // Usamos safeScope en lugar de scope
       if (safeScope === 'BROKER' || safeScope === 'BROKER_PRODUCT') { 
          brokersCtrl?.setValidators(Validators.required);
       } else {
          brokersCtrl?.clearValidators();
          brokersCtrl?.setValue([]); 
       }
       brokersCtrl?.updateValueAndValidity();

       // 2. Lógica Productos y Pólizas (Arrays)
       // Usamos safeScope para que .includes() no falle
       if (!safeScope.includes('POLICY')) policiesArray.clear();
    });
  }

  private loadCatalogData() {
    this.loadingService.setLoadingState(true);
    forkJoin({
      schemes: this.schemeService.getSchemesOptions(),
      scopes: this.schemeService.getScopesOptions(),
      incentives: this.schemeService.getIncentiveCategoriesOptions(),
      brokers: this.schemeService.getAllBrokers(),
      products: this.productService.getAllProducts(),
      policies: this.policyService.getAllPolicies()
    }).subscribe({
      next: (data) => {
        this.schemeOptions = data.schemes;
        this.scopeOptions = data.scopes;
        this.incentiveCategoryOptions = data.incentives;

        this.brokerOptions = data.brokers.map((b: any) => ({
           label: b.username, // O b.name
           value: b.id
        }));
        this.productsOptions = data.products.map((b: any) => ({
           label: `${b.id} - ${b.name}`, // O b.name
           value: b.id
        }));
        this.allPolicies = data.policies;

        this.loadingService.setLoadingState(false);
      },
      error: (err) => {
        console.error(err);
        this.loadingService.setLoadingState(false);
      }
    });
  }

  // --- GETTERS DE VISIBILIDAD (Según Scope) ---
  get currentScope(): string { return this.createForm.get('scope')?.value || ''; }

  get showProductsSection(): boolean {
    return this.currentScope.includes('PRODUCT');
  }
  get showBrokersSection(): boolean {
    return this.currentScope.includes('BROKER');
  }
  get showPoliciesSection(): boolean {
    return this.currentScope.includes('POLICY') || this.currentScope === 'INSURANCE_POLICY';
  }

  // --- LÓGICA DEL MODAL DE PÓLIZAS ---

  openPolicyModal() {
    this.isPolicyModalOpen = true;
    this.policySearchTerm = '';
    this.policySelectedBroker = null;
    this.policySearchResults = []; // O this.allPolicies si quieres mostrar todas al inicio
    this.tempSelectedPolicies = [...this.selectedPoliciesList];

    this.checkAllSelectedState();
  }

  onPolicyModalClose() { 
    this.isPolicyModalOpen = false; 
  }

  clearPolicySelection() {
    this.tempSelectedPolicies = [];
    this.isAllPoliciesSelected = false;
  }

  private checkAllSelectedState() {
    if (this.policySearchResults.length === 0) {
      this.isAllPoliciesSelected = false;
      return;
    }
    // Si todos los resultados visibles están en tempSelectedPolicies, marcamos el header
    this.isAllPoliciesSelected = this.policySearchResults.every(p => this.isPolicySelected(p));
  }
  // --- Búsqueda y Filtros (Se mantienen igual) ---
  
  onPolicySearch(term: string) {
    this.policySearchTerm = term;
    this.executePolicySearch();
  }

  onPolicyBrokerFilter(brokerId: any) {
    this.policySelectedBroker = brokerId;
    this.executePolicySearch();
  }

  executePolicySearch() {
    this.policySearchResults = this.allPolicies.filter(policy => {
      const matchNum = this.policySearchTerm 
        ? policy.policyNumber.toLowerCase().includes(this.policySearchTerm.toLowerCase()) 
        : true;
      const matchBrok = this.policySelectedBroker 
        ? policy.brokerId == this.policySelectedBroker 
        : true;
      return matchNum && matchBrok;
    });
    // Al filtrar, recalculamos si "todos los visibles" están seleccionados
    this.checkAllSelectedState();
  }

  // --- NUEVA LÓGICA DE SELECCIÓN (Vía Action) ---

  onPolicyTableAction(evt: TableActionEvent) {
    if (!evt.dataField) return;

    // Casteamos a 'any' o a tu interfaz 'Policy' si la tienes importada
    const policy = evt.dataField;

    if (evt.event === 'select') {
      this.togglePolicySelection(policy);
    }
  }

  /**
   * Agrega o quita la póliza del array temporal.
   * Esta función ahora es llamada por onPolicyTableAction.
   */
  togglePolicySelection(p: any) {
    const idx = this.tempSelectedPolicies.findIndex(x => x.id === p.id);
    
    if (idx > -1) {
      this.tempSelectedPolicies.splice(idx, 1); // Si ya estaba, la sacamos (Desmarcar)
    } else {
      this.tempSelectedPolicies.push(p); // Si no estaba, la agregamos (Marcar)
    }

    this.checkAllSelectedState();
  }
  toggleSelectAllPolicies(ev: any) {
    const isChecked = ev.target.checked;
    this.isAllPoliciesSelected = isChecked; // Actualizamos variable visual

    if (isChecked) {
      // Agregar los visibles que no estén ya
      this.policySearchResults.forEach(p => {
        if (!this.isPolicySelected(p)) this.tempSelectedPolicies.push(p);
      });
    } else {
      // Remover SOLO los visibles de la selección temporal
      // (Mantenemos los que no se ven por el filtro, si esa es la lógica deseada)
      const visibleIds = this.policySearchResults.map(p => p.id);
      this.tempSelectedPolicies = this.tempSelectedPolicies.filter(p => !visibleIds.includes(p.id));
    }
  }
  /**
   * Verifica si está seleccionada (Útil si necesitas cambiar algo visualmente fuera de la tabla)
   * Nota: La app-table ya maneja su propio ícono check/plus internamente con su lógica checkAction
   */
  isPolicySelected(p: any) { 
    return this.tempSelectedPolicies.some(x => x.id === p.id); 
  }

  // --- CONFIRMACIÓN (Mover del temporal al formulario) ---

  addSelectedPoliciesToForm() {
    const formArray = this.createForm.get('policies') as FormArray;
    formArray.clear();
    this.tempSelectedPolicies.forEach(p => {
      // Validamos duplicados para no agregar la misma póliza dos veces
      const exists = formArray.controls.some(ctrl => ctrl.value.id === p.id);
      if (!exists) {
        formArray.push(this.fb.control(p));
      }
    });
    
    this.onPolicyModalClose();
  }

  // --- LÓGICA DE PANTALLA PRINCIPAL (Sin cambios) ---
  removePolicy(index: number) { 
    (this.createForm.get('policies') as FormArray).removeAt(index); 
  }

  removeAllPolicies() {
    (this.createForm.get('policies') as FormArray).clear();
  }
  
  get selectedPoliciesList() { 
    return (this.createForm.get('policies') as FormArray).value; 
  }
  
  get paginatedPoliciesList() {
    const list = this.selectedPoliciesList; 
    const start = this.policiesPageIndex * this.policiesPageSize;
    const end = start + this.policiesPageSize;
    return list.slice(start, end);
  }

  // 2. Función de cambio de página (Adaptada de tu onMobilePageChange)
  onPoliciesPageChange(page1Based: number) {
    this.policiesPageIndex = Math.max(0, page1Based - 1);
    // No necesitamos llamar a una función rebuild porque el getter 'paginatedPoliciesList' 
    // se actualiza automáticamente al cambiar policiesPageIndex.
  }
  
}

const MOCK_FULL_DATA: any[] = [
  {
    "id": 12, "name": "Esquema Mixto Premium", "commissionSchemeId": 4, "byBroker": true, "byProduct": true,
    "hasIncentiveScheme": true, "createdByUserId": 2, "creationDate": "2025-11-12T16:30:30", "lastUpdate": null,
    "validFrom": "2024-01-01T00:00:00", "validUntil": "2024-12-31T23:59:59", "isActive": true, "enterpriseId": 1,
    "deletable": true, "editable": true, "schemaType": "PERCENTAGE_PRODUCT_BROKER", "scope": "BROKER_PRODUCT", "commissionPercentage": 0
  },
  {
    "id": 11, "name": "Esquema por Producto", "commissionSchemeId": 3, "byBroker": false, "byProduct": true,
    "hasIncentiveScheme": false, "createdByUserId": 2, "creationDate": "2025-11-12T16:30:30", "lastUpdate": null,
    "validFrom": "2024-01-01T00:00:00", "validUntil": "2024-12-31T23:59:59", "isActive": true, "enterpriseId": 1,
    "deletable": true, "editable": true, "schemaType": "PERCENTAGE", "scope": "PRODUCT", "commissionPercentage": 0
  },
  {
    "id": 10, "name": "Esquema por Corredor", "commissionSchemeId": 2, "byBroker": true, "byProduct": false,
    "hasIncentiveScheme": true, "createdByUserId": 1, "creationDate": "2025-11-12T16:30:30", "lastUpdate": null,
    "validFrom": "2024-01-01T00:00:00", "validUntil": "2024-12-31T23:59:59", "isActive": true, "enterpriseId": 1,
    "deletable": true, "editable": true, "schemaType": "FIXED", "scope": "BROKER", "commissionPercentage": 0
  },
  {
    "id": 9, "name": "Esquema Básico 2024", "commissionSchemeId": 1, "byBroker": false, "byProduct": false,
    "hasIncentiveScheme": false, "createdByUserId": 1, "creationDate": "2025-11-12T16:30:30", "lastUpdate": null,
    "validFrom": "2024-01-01T00:00:00", "validUntil": "2024-12-31T23:59:59", "isActive": true, "enterpriseId": 1,
    "deletable": true, "editable": true, "schemaType": "PERCENTAGE", "scope": "GENERAL", "commissionPercentage": 0
  },
  {
    "id": 8, "name": "Esquema Mixto Premium II", "commissionSchemeId": 4, "byBroker": true, "byProduct": true,
    "hasIncentiveScheme": true, "createdByUserId": 2, "creationDate": "2025-11-12T16:18:21", "lastUpdate": null,
    "validFrom": "2024-01-01T00:00:00", "validUntil": "2024-12-31T23:59:59", "isActive": true, "enterpriseId": 1,
    "deletable": true, "editable": true, "schemaType": "PERCENTAGE_PRODUCT_BROKER", "scope": "BROKER_PRODUCT", "commissionPercentage": 0
  },
  {
    "id": 7, "name": "Esquema por Producto II", "commissionSchemeId": 3, "byBroker": false, "byProduct": true,
    "hasIncentiveScheme": false, "createdByUserId": 2, "creationDate": "2025-11-12T16:18:21", "lastUpdate": null,
    "validFrom": "2024-01-01T00:00:00", "validUntil": "2024-12-31T23:59:59", "isActive": true, "enterpriseId": 1,
    "deletable": true, "editable": true, "schemaType": "PERCENTAGE", "scope": "PRODUCT", "commissionPercentage": 0
  },
  {
    "id": 6, "name": "Esquema por Corredor II", "commissionSchemeId": 2, "byBroker": true, "byProduct": false,
    "hasIncentiveScheme": true, "createdByUserId": 1, "creationDate": "2025-11-12T16:18:21", "lastUpdate": null,
    "validFrom": "2024-01-01T00:00:00", "validUntil": "2024-12-31T23:59:59", "isActive": true, "enterpriseId": 1,
    "deletable": true, "editable": true, "schemaType": "FIXED", "scope": "BROKER", "commissionPercentage": 0
  },
  {
    "id": 5, "name": "Esquema Básico 2024 II", "commissionSchemeId": 1, "byBroker": false, "byProduct": false,
    "hasIncentiveScheme": false, "createdByUserId": 1, "creationDate": "2025-11-12T16:18:21", "lastUpdate": null,
    "validFrom": "2024-01-01T00:00:00", "validUntil": "2024-12-31T23:59:59", "isActive": true, "enterpriseId": 1,
    "deletable": true, "editable": true, "schemaType": "PERCENTAGE", "scope": "GENERAL", "commissionPercentage": 0
  },
  {
    "id": 4, "name": "Esquema Mixto Premium III", "commissionSchemeId": 4, "byBroker": true, "byProduct": true,
    "hasIncentiveScheme": true, "createdByUserId": 2, "creationDate": "2025-11-12T16:17:10", "lastUpdate": null,
    "validFrom": "2024-01-01T00:00:00", "validUntil": "2024-12-31T23:59:59", "isActive": true, "enterpriseId": 1,
    "deletable": true, "editable": true, "schemaType": "PERCENTAGE_PRODUCT_BROKER", "scope": "BROKER_PRODUCT", "commissionPercentage": 0
  },
  {
    "id": 3, "name": "Esquema por Producto III", "commissionSchemeId": 3, "byBroker": false, "byProduct": true,
    "hasIncentiveScheme": false, "createdByUserId": 2, "creationDate": "2025-11-12T16:17:10", "lastUpdate": null,
    "validFrom": "2024-01-01T00:00:00", "validUntil": "2024-12-31T23:59:59", "isActive": true, "enterpriseId": 1,
    "deletable": true, "editable": true, "schemaType": "PERCENTAGE", "scope": "PRODUCT", "commissionPercentage": 0
  },
  {
    "id": 2, "name": "Esquema por Corredor III", "commissionSchemeId": 2, "byBroker": true, "byProduct": false,
    "hasIncentiveScheme": true, "createdByUserId": 1, "creationDate": "2025-11-12T16:17:10", "lastUpdate": null,
    "validFrom": "2024-01-01T00:00:00", "validUntil": "2024-12-31T23:59:59", "isActive": true, "enterpriseId": 1,
    "deletable": true, "editable": true, "schemaType": "FIXED", "scope": "BROKER", "commissionPercentage": 10
  },
  {
    "id": 1, "name": "Esquema Básico 2024 III", "commissionSchemeId": 1, "byBroker": false, "byProduct": false,
    "hasIncentiveScheme": false, "createdByUserId": 1, "creationDate": "2025-11-12T16:17:10", "lastUpdate": null,
    "validFrom": "2024-01-01T00:00:00", "validUntil": "2024-12-31T23:59:59", "isActive": true, "enterpriseId": 1,
    "deletable": true, "editable": true, "schemaType": "PERCENTAGE", "scope": "GENERAL", "commissionPercentage": 0
  }
];