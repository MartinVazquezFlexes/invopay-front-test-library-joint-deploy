import { Router } from '@angular/router';
import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { SchemeService } from './../../services/scheme.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { PaginatedResponse, CommissionSchemeInstance } from '../../interface/scheme';
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

  schemaTypes = ['PERCENTAGE', 'FIXED', 'PERCENTAGE_PRODUCT_BROKER'];
  scopeTypes = ['GENERAL', 'BROKER', 'PRODUCT', 'BROKER_PRODUCT'];

  private originalSchemes: CommissionSchemeInstance[] = [];
  openMenuId: number | null = null;
  @ViewChildren('menuRef') menuRefs!: QueryList<ElementRef<HTMLElement>>;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private breakpoint: BreakpointObserver,
    private schemeService: SchemeService,
    public loadingService: LoadingService,
    private translate: TranslateService
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
      } else {
        this.pageIndex = this.lastDesktopPageIndex;
        this.pageSize = this.lastDesktopPageSize;
        this.rebuildDesktopSlice();
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
      /*this.selectedScheme = scheme;

      this.editForm.patchValue({
        id: scheme.id,
        name: scheme.name,
        schemaType: scheme.schemaType,
        scope: scheme.scope,
        commissionPercentage: scheme.commissionPercentage,
        isActive: scheme.isActive
      });

      // Deshabilitamos todo para que sea solo lectura
      this.editForm.disable();

      this.isViewModalOpen = true;*/
      this.router.navigate(['/invopay/instance-detail', scheme.id]);
      console.log('Ver detalles:', scheme);
    }
    
    else if (evt.event === 'edit') {
      /*this.selectedScheme = scheme;

      this.editForm.enable();
  
      this.editForm.patchValue({
        id: scheme.id,
        name: scheme.name,
        schemaType: scheme.schemaType,
        scope: scheme.scope,
        commissionPercentage: scheme.commissionPercentage,
        isActive: scheme.isActive
      });

      this.isEditModalOpen = true;*/
      console.log('Editar:', scheme);
    }
  }

  onAddNewScheme(): void {
    /*this.createForm.reset({
      isActive: true,            
      commissionPercentage: 0,   
      schemaType: null,          
      scope: null                
    });
    this.isCreateModalOpen = true;*/
    console.log('Crear nuevo esquema');
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

  onConfirmCreate(): void {
    if (this.createForm.invalid) return;
    
    this.createBusy = true;
    console.log('Payload Crear:', this.createForm.value);
    
    setTimeout(() => {
      this.createBusy = false;
      this.onCreateModalClose();
      this.loadPage(this.pageIndex, this.pageSize);
    }, 1000);
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