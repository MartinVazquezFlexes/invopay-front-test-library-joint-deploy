import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { LoadingService } from '../../../shared/services/loading.service';
import IpSelectInputOption from '../../interface/ip-select-input-option';

import {
  ProductItem,
  AppProductItem,
  ProductDocument,
  CreateProductDTO,
  UpdateProductDTO
} from '../../interface/product-interfaces';

type TableActionEvent = {
  event: string;
  key?: string;
  dataField?: any;
};

@Component({
  selector: 'lib-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {


  products: AppProductItem[] = [];
  titlesFile = new Map<string, string>([
    ['logoUrl', ''],
    ['name', 'Nombre del Producto'],
    ['descriptionShort', 'Descripción'],
    ['statusText', 'Activo'],
  ]);

  pageIndex = 0;
  pageSize = 10;
  total = 0;
  mobilePageIndex = 0;
  private readonly mobilePageSize = 10;
  private lastDesktopPageIndex = 0;
  private lastDesktopPageSize = this.pageSize;
  paginatorReload = false;
  itemsPerPageControl = new FormControl('10');
  pageOptions: IpSelectInputOption[] = [
    { value: '10', label: '10' },
    { value: '15', label: '15' },
    { value: '20', label: '20' },
    { value: '25', label: '25' },
  ];

  private originalProducts: AppProductItem[] = [];
  loading = false;
  isHandset = false;
  openMenuId: number | null = null;
  selectedProduct: AppProductItem | null = null;

  isViewModalOpen = false;

  isDeleteModalOpen = false;
  deleteBusy = false;

  isEditModalOpen = false;
  editBusy = false;
  editForm!: FormGroup;

  isCreateModalOpen = false;
  createBusy = false;
  createForm!: FormGroup;
  

  private logoFileToUpload: File | null = null;

  @ViewChildren('menuRef') menuRefs!: QueryList<ElementRef<HTMLElement>>;

  constructor(
    private breakpoint: BreakpointObserver,
    private elementRef: ElementRef,
    private formBuilder: FormBuilder,
    private productService: ProductService,
    public loadingService: LoadingService
  ) { }

  ngOnInit() {
    this.breakpoint.observe(['(max-width: 768px)']).subscribe(state => {
      const enteringHandset = !!state.matches;
      if (enteringHandset === this.isHandset) return;
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

    this.createForm = this.formBuilder.group({
      logoUrl: [''],
      code: ['', Validators.required],
      name: ['', Validators.required],
      description: ['', Validators.required],
      type: ['INDIVIDUAL', Validators.required],
      longDescription: [''],
      externalId: [''],
      insuranceEnterprise: [''],
      documents: this.formBuilder.array([]),
      isActive: [true]
    });

    this.editForm = this.formBuilder.group({
      id: [null, Validators.required],
      logoUrl: [''],
      code: [{ value: '', disabled: true }, Validators.required],
      name: ['', Validators.required],
      description: ['', Validators.required],
      type: ['INDIVIDUAL', Validators.required],
      longDescription: [''],
      externalId: [''],
      insuranceEnterprise: [''],
      documents: this.formBuilder.array([]),
      isActive: [true]
    });

    this.loadPage(this.pageIndex, this.pageSize);
  }

  private loadPage(index: number, size: number) {
    this.loadingService.setLoadingState(true);
    this.productService.getProducts(index, size).subscribe({
      next: (response) => {
        this.products = this.withDisplayStatus(response.content);
        this.originalProducts = [...this.products];
        this.total = response.totalElements;
        this.pageIndex = response.number;
        this.pageSize = response.size;

        this.loadingService.setLoadingState(false);
      },
      error: (err) => {
        console.error("Error al cargar productos:", err);
        this.loadingService.setLoadingState(false);
      }
    });
  }

  private withDisplayStatus(items: ProductItem[]): AppProductItem[] {
    return items.map(item => ({
      ...item,
      statusText: item.isActive ? 'Sí' : 'No'
    }));
  }

  private updateLocalData(updatedItem: AppProductItem): void {
    const update = (list: AppProductItem[]) => {
      const index = list.findIndex(n => n.id === updatedItem.id);
      if (index !== -1) {
        list[index] = updatedItem;
      }
      return list;
    };
    this.originalProducts = update([...this.originalProducts]);
    this.products = update([...this.products]);
  }

  onConfirmCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    if (!this.logoFileToUpload) {
      alert('Por favor, seleccione un archivo de logo.');
      return;
    }
    this.loadingService.setLoadingState(true);
    this.createBusy = true;

    this.productService.createProduct(this.createForm.value, this.logoFileToUpload).subscribe({
      next: (createdItem: ProductItem) => {
        this.loadPage(this.pageIndex, this.pageSize);
        this.onCreateModalClose();

        this.createBusy = false;
        this.loadingService.setLoadingState(false);
      },
      error: (err: any) => {
        console.error(err);
        alert('Error al crear el producto: ' + (err.error?.message || err.message));
        this.createBusy = false;
        this.loadingService.setLoadingState(false);
      }
    });
  }

  onConfirmEdit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.loadingService.setLoadingState(true);
    this.editBusy = true;
    const payload: any = this.editForm.getRawValue();

    this.productService.updateProduct(payload, this.logoFileToUpload).subscribe({
      next: (updatedItem: ProductItem) => {
        this.updateLocalData(this.withDisplayStatus([updatedItem])[0]);
        this.onEditModalClose();

        this.editBusy = false;
        this.loadingService.setLoadingState(false);
      },
      error: (err: any) => {
        console.error(err);
        alert('Error al editar el producto: ' + (err.error?.message || err.message));
        this.editBusy = false;
        this.loadingService.setLoadingState(false);
      }
    });
  }

  onConfirmDelete(): void {
    if (!this.selectedProduct) return;
    const productToDelete = this.selectedProduct;

    this.loadingService.setLoadingState(true);;
    this.deleteBusy = true;

    this.productService.deactivateProduct(productToDelete.id).subscribe({
      next: () => {
        const updatedItem = this.withDisplayStatus([{
          ...productToDelete,
          isActive: false,
          deletable: false,
          editable: false
        }])[0];

        this.updateLocalData(updatedItem);

        this.deleteBusy = false;
        this.loadingService.setLoadingState(false);
        this.onDeleteModalClose();
      },
      error: (err: any) => {
        console.error(err);
        alert('Error al eliminar el producto: ' + (err.error?.message || err.message));
        this.deleteBusy = false;
      }
    });
  }

  onAddNewProduct(): void {
    this.createForm.reset({
      type: 'INDIVIDUAL',
      isActive: true,
    });
    this.logoFileToUpload = null;
    this.isCreateModalOpen = true;
  }

  onRowAction(evt: TableActionEvent) {
    if (evt.event === 'detail' && evt.dataField) {
      this.selectedProduct = evt.dataField as AppProductItem;

      this.editForm.patchValue({
        id: this.selectedProduct.id,
        code: this.selectedProduct.code,
        name: this.selectedProduct.name,
        description: this.selectedProduct.descriptionShort,
        longDescription: this.selectedProduct.descriptionDetailed,
        isActive: this.selectedProduct.isActive,
        logoUrl: this.selectedProduct.logoUrl,
        type: (this.selectedProduct as any).type || 'INDIVIDUAL',
        externalId: (this.selectedProduct as any).externalId || '',
        insuranceEnterprise: (this.selectedProduct as any).insuranceEnterprise || ''
      });

      this.editForm.disable();

      this.isViewModalOpen = true;
    }
    else if (evt.event === 'edit' && evt.dataField) {
      this.selectedProduct = evt.dataField as AppProductItem;

      this.editForm.patchValue({
        id: this.selectedProduct.id,
        code: this.selectedProduct.code,
        name: this.selectedProduct.name,
        description: this.selectedProduct.descriptionShort,
        longDescription: this.selectedProduct.descriptionDetailed,
        isActive: this.selectedProduct.isActive,
        logoUrl: this.selectedProduct.logoUrl,
        type: (this.selectedProduct as any).type || 'INDIVIDUAL',
        externalId: (this.selectedProduct as any).externalId || '',
        insuranceEnterprise: (this.selectedProduct as any).insuranceEnterprise || ''
      });
      this.setDocumentationFormArray(this.editForm, this.selectedProduct.documents);
      this.logoFileToUpload = null;
      this.isEditModalOpen = true;
    }
    else if (evt.event === 'delete' && evt.dataField) {
      this.selectedProduct = evt.dataField as AppProductItem;
      this.isDeleteModalOpen = true;
    }
  }

  onViewModalClose(): void {
    this.isViewModalOpen = false;
    this.selectedProduct = null;

    this.editForm.enable();
  }
  onDeleteModalClose(): void {
    this.isDeleteModalOpen = false;
    this.selectedProduct = null;
    this.deleteBusy = false;
  }
  onCreateModalClose(): void {
    this.isCreateModalOpen = false;
    this.createBusy = false;
    this.createForm.reset();
  }
  onEditModalClose(): void {
    this.isEditModalOpen = false;
    this.selectedProduct = null;
    this.editBusy = false;
    this.editForm.reset();
  }

  documentationFormArray(form: FormGroup): FormArray {
    return form.get('documents') as FormArray;
  }

  removeDocumentRow(form: FormGroup, index: number): void {
    const formArray = this.documentationFormArray(form);
    const docValue = formArray.at(index).value;

    if (this.isCreateModalOpen || !docValue.description) {
      formArray.removeAt(index);
      return;
    }

    if (confirm(`¿Desea eliminar el documento "${docValue.description}"?`)) {
      
      this.loadingService.setLoadingState(true);
      
      this.productService.deleteDocument(this.selectedProduct!.id, docValue.description)
        .subscribe({
          next: () => {
            formArray.removeAt(index);
            
            if (this.selectedProduct && this.selectedProduct.documents) {
               this.selectedProduct.documents = this.selectedProduct.documents.filter(
                 d => d.description !== docValue.description
               );
            }
            
            this.loadingService.setLoadingState(false);
          },
          error: (err) => {
            console.error(err);
            alert('Error al eliminar el documento.');
            this.loadingService.setLoadingState(false);
          }
        });
    }
  }

  onDocumentFileSelected(event: Event, formGroup: FormGroup, index: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    
    this.loadingService.setLoadingState(true);

    this.productService.uploadDocumentFile(file).subscribe({
      next: (response) => {
        const formArray = this.documentationFormArray(formGroup);
        const rowGroup = formArray.at(index);
        const currentDescription = rowGroup.get('description')?.value;
        rowGroup.patchValue({
          filePath: response.filePath, 
          description: currentDescription ? currentDescription : file.name
        });

        this.loadingService.setLoadingState(false);
      },
      error: (err) => {
        console.error('Error subiendo documento:', err);
        alert('Error al subir el documento.');
        this.loadingService.setLoadingState(false);
        input.value = '';
      }
    });
  }

  onFileSelected(event: Event, formGroup: FormGroup, controlName: string): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    if (controlName === 'logoUrl') {
      this.logoFileToUpload = file;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      formGroup.patchValue({ [controlName]: dataUrl });
      formGroup.get(controlName)?.markAsDirty();
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  onSort(event: any): void {
    if (event?.key !== 'name') return;
    const direction = event.event;
    const base = [...this.originalProducts];
    if (direction === 'clean') {
      this.products = this.pageSlice(base, this.pageIndex, this.pageSize);
      return;
    }
    const sortFn = (a: AppProductItem, b: AppProductItem) => {
      const aVal = a.name.toLocaleLowerCase('es');
      const bVal = b.name.toLocaleLowerCase('es');
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    };
    base.sort(sortFn);
    this.originalProducts = base;
    this.products = this.pageSlice(this.originalProducts, this.pageIndex, this.pageSize);
  }
  toggleMenu(id: number): void {
    this.openMenuId = this.openMenuId === id ? null : id;
  }
  private pageSlice<T>(arr: T[], pageIndex: number, pageSize: number): T[] {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return arr.slice(start, end);
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
  private triggerPaginatorReload(): void {
    this.paginatorReload = true;
    setTimeout(() => (this.paginatorReload = false));
  }
  onMobilePageChange(page1Based: number) {
    this.mobilePageIndex = Math.max(0, page1Based - 1);
    this.rebuildMobileSlice();
  }

  private newDocumentGroup(): FormGroup {
    return this.formBuilder.group({
      description: ['', Validators.required],
      filePath: ['', Validators.required],
      url: ['']
    });
  }
  addDocumentRow(form: FormGroup): void {
    this.documentationFormArray(form).push(this.newDocumentGroup());
  }
  private setDocumentationFormArray(form: FormGroup, docs: ProductDocument[]): void {
    const formArray = this.documentationFormArray(form);
    formArray.clear();
    if (docs && docs.length > 0) {
      docs.forEach(doc => {
        formArray.push(this.formBuilder.group({
          description: [doc.description, Validators.required],
          filePath: [doc.filePath],
          url: [doc.url]
        }));
      });
    }
  }
  private rebuildMobileSlice(): void {
    this.loadPage(this.mobilePageIndex, this.mobilePageSize);
  }
  private rebuildDesktopSlice(): void {
    this.loadPage(this.pageIndex, this.pageSize);
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.openMenuId == null) return;
    const container = this.menuRefs
      ?.find(ref => ref.nativeElement.getAttribute('data-id') === String(this.openMenuId))
      ?.nativeElement;
    if (!container || !container.contains(event.target as Node)) {
      this.openMenuId = null;
    }
  }
}