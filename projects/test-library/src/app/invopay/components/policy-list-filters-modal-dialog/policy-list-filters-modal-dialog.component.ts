import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FiltersDialogData } from './policyListFilterDialogData';

@Component({
  selector: 'app-policy-list-filters-modal-dialog',
  templateUrl: './policy-list-filters-modal-dialog.component.html',
  styleUrls: ['./policy-list-filters-modal-dialog.component.scss']
})
export class PolicyListFiltersModalDialogComponent {
  showValidationError = false;
  
  constructor(
    public dialogRef: MatDialogRef<PolicyListFiltersModalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FiltersDialogData
  ) {}

  /**
   * Validate min one filter selected
   */
  hasAtLeastOneFilter(): boolean {
    const form = this.data.controlsForm;
    
    const hasProduct = !!form.controls.productFilter.value;
    const hasClient = !!form.controls.clientFilter.value;
    const hasBroker = !!form.controls.brokerFilter.value;
    const hasDateStart = !!form.controls.dateStart.value;
    const hasDateEnd = !!form.controls.dateEnd.value;
    
    return hasProduct || hasClient || hasBroker || hasDateStart || hasDateEnd;
  }
  get canSearch(): boolean {
  return this.hasAtLeastOneFilter();
  }

  onSearch(): void {
    if (!this.hasAtLeastOneFilter()) {
      this.showValidationError = true;
      return;
    }
    
    this.showValidationError = false;
    this.dialogRef.close({ action: 'search' });
  }

  onClear(): void {
    this.showValidationError = false;
    this.dialogRef.close({ action: 'clear' });
  }

  onClose(): void {
    this.showValidationError = false;
    this.dialogRef.close();
  }
}

