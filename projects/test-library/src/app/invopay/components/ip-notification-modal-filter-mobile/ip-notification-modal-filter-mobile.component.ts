import { Component, EventEmitter, Input, Output, OnDestroy, SimpleChanges, OnInit, OnChanges, Inject, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import IpSelectInputOption from '../../../../../../base/src/lib/interfaces/ip-select-input-option';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-ip-notification-modal-filter-mobile',
  templateUrl: './ip-notification-modal-filter-mobile.component.html',
  styleUrls: ['./ip-notification-modal-filter-mobile.component.scss']
})
export class IpNotificationModalFilterMobileComponent implements OnDestroy,OnInit,OnChanges {
  private subscription = new Subscription();
  
  // Inputs
  entities: IpSelectInputOption[] = []; 
  users: IpSelectInputOption[] = [];    
  currentFilters: any = {};
  @Input() mode: 'broker' | 'insurance' = 'broker';

  // Outputs
  @Output() applyFilters = new EventEmitter<any>();
  @Output() clearFilters = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();

  // Form Controls
  answeredControl = new FormControl('');
  entityControl = new FormControl('');
  userControl = new FormControl('');

  // Selected values for template
  selectedAnswered: string = '';
  selectedEntity: string = '';
  selectedUser: string = '';
  showMobileFiltersModal = true;
  hasMobileSearched = false;

  // Filter options
  answeredOptions: IpSelectInputOption[] = [
    { label: '', labelCode: 'IP.NOTIFICATIONS.FILTERS.YES', value: 'si' },
    { label: '', labelCode: 'IP.NOTIFICATIONS.FILTERS.NO', value: 'no' }
  ];
  
  entityOptions: IpSelectInputOption[] = [];
  userOptions: IpSelectInputOption[] = [];

  constructor(
    private translate: TranslateService,
    public dialogRef: MatDialogRef<IpNotificationModalFilterMobileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cdr: ChangeDetectorRef
  ) {
    if (data) {
      this.entities = Array.isArray(data.entities) ? [...data.entities] : [];
      this.users = Array.isArray(data.users) ? [...data.users] : [];
      this.currentFilters = data.currentFilters || {};
      this.mode = data.mode || 'broker'; 
    }
  }

  ngOnInit(): void {
      console.log('Modal - OnInit - Entities:', this.entities);
  console.log('Modal - OnInit - Users:', this.users);
    this.initializeFilters();
  }
  ngOnChanges(changes: SimpleChanges) {
  console.log('Input changes:', changes);
  if (changes['entities'] || changes['users']) {
    this.initializeFilters();
  }
}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initializeFilters(): void {
    this.entityOptions = [...this.entities];
    this.userOptions = [...this.users];

    if (this.currentFilters) {
      this.answeredControl.setValue(this.currentFilters.answered || '');
      this.entityControl.setValue(this.currentFilters.entity || '');
      this.userControl.setValue(this.currentFilters.user || '');
      this.selectedAnswered = this.currentFilters.answered || '';
      this.selectedEntity = this.currentFilters.entity || '';
      this.selectedUser = this.currentFilters.user || '';
      
      // Initialize hasMobileSearched from parent's hasSearched state
      if (this.currentFilters.hasSearched) {
        this.hasMobileSearched = true;
      }
    }
  }

  onSearchPerformed(filters: any): void {
    this.selectedAnswered = filters.answered || '';
    this.selectedEntity = filters.entity || '';
    this.selectedUser = filters.user || '';
    this.hasMobileSearched = true; // Enable clear button
    
    // Emit with hasSearched: true to ensure parent updates its state
    this.applyFilters.emit({
      ...filters,
      hasSearched: true
    });
  }

  onFiltersCleared(): void {
    this.answeredControl.setValue('');
    this.entityControl.setValue('');
    this.userControl.setValue('');
    this.selectedAnswered = '';
    this.selectedEntity = '';
    this.selectedUser = '';
    this.hasMobileSearched = false;
    
    // Emit the cleared state first
    this.clearFilters.emit();
    
    // Then emit empty filters with hasSearched: false
    this.applyFilters.emit({
      answered: '',
      entity: '',
      user: '',
      hasSearched: false
    });
    
    // Force update the view
    this.cdr.detectChanges();
  }

  onClose(): void {
    this.closeModal.emit();
    this.dialogRef.close();
  }

  onUserChanged(event: Event): void {
    this.selectedUser = (event.target as HTMLInputElement).value;
  }

  onMobileSearch(): void {
    this.hasMobileSearched = true;
    this.onSearchPerformed({
      answered: this.selectedAnswered,
      entity: this.selectedEntity,
      user: this.selectedUser
    });
  }

  onMobileClearFilters(): void {
    this.onFiltersCleared();
  }

  get isMobileSearchDisabled(): boolean {
    if (this.mode === 'insurance') {
      return !(this.selectedAnswered && this.selectedEntity && this.selectedUser);
    }
    return !(this.selectedAnswered || this.selectedEntity || this.selectedUser);
  }

  get isMobileClearEnabled(): boolean {
    return this.hasMobileSearched;
    
  }
}