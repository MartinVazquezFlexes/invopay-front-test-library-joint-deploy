import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-ip-date-input',
  templateUrl: './ip-date-input.component.html',
  styleUrls: ['./ip-date-input.component.scss']
})
export class IpDateInputComponent {
  @Input() control = new FormControl();
  @Input() label = '';
  @Input() inputId = '';
  @Input() min?: string;
  @Input() max?: string;
  @Input() inputStyle?: string;
  @Input() withHour: boolean = false;
  @Output() changed = new EventEmitter<any>();

  onChanged(ev:Event) {
    this.changed.emit(ev);
  }

  errorMessages: Record<string,string>={
    required:'IP.VALIDATORS.REQUIRED',
    tooOld: "IP.VALIDATORS.DATE_TOO_OLD",
    tooFar: "IP.VALIDATORS.DATE_TOO_FAR",
    dateDifference: "IP.VALIDATORS.DATE-DIFFERENCE-ERROR",
    afterActualDate: "IP.VALIDATORS.AFTER_ACTUAL_DATE"
  }

  getErrorMessage(): string {
    if (this.control.touched && this.control.invalid && this.control.errors) {      
      const errorKey = Object.keys(this.control.errors || {})[0];
      return this.errorMessages[errorKey] || '';
    }
    return '';
  }
}
