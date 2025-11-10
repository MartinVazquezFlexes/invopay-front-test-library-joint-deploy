import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-additional-filters-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './additional-filters-modal.component.html',
  styleUrls: ['./additional-filters-modal.component.scss']
})
export class AdditionalFiltersModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() clearLabel = '';
  @Input() cancelLabel = '';
  @Input() applyLabel = '';
  
  @Output() openChange = new EventEmitter<boolean>();
  @Output() clear = new EventEmitter<void>();
  @Output() apply = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onOverlayClick(): void {
    this.close();
  }

  onClearClick(): void {
    this.clear.emit();
  }

  onCancelClick(): void {
    this.cancel.emit();
    this.close();
  }

  onApplyClick(): void {
    this.apply.emit();
  }

  private close(): void {
    this.open = false;
    this.openChange.emit(false);
  }
}
