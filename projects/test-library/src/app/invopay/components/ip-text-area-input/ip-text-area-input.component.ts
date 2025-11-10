import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-ip-text-area-input',
  templateUrl: './ip-text-area-input.component.html',
  styleUrls: ['./ip-text-area-input.component.scss']
})
export class IpTextAreaInputComponent {
  @Input() inputId = '';
  @Input() control = new FormControl();
  @Input() label = '';

  errorMessages: Record<string,string>={
    required:'IP.VALIDATORS.REQUIRED',
    whitespace:'IP.VALIDATORS.REQUIRED',
    maxlength:'IP.VALIDATORS.STRING_TOO_LARGE-',
  }

  getErrorMessage(): string {
    if (this.control.touched && this.control.invalid && this.control.errors) {
      const errorKey = Object.keys(this.control.errors || {})[0]; 
      if (errorKey === 'maxlength'){
        const max = (Object.values(this.control.errors|| {})[0])['requiredLength']
        return this.errorMessages[errorKey] + max || '';
      }
      return this.errorMessages[errorKey] || '';
    }
    return '';
  }
}
