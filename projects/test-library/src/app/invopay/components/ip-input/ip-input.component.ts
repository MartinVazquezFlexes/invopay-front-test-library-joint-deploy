import { Component, computed, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ERROR_MESSAGES } from '../../constants/error-messages';

@Component({
  selector: 'app-ip-input',
  templateUrl: './ip-input.component.html',
  styleUrls: ['./ip-input.component.scss']
})
export class IpInputComponent implements OnInit {
  @Input() inputId = '';
  @Input() control = new FormControl();
  @Input() label = '';
  @Input() type: 'text' | 'email' | 'number' = 'text';
  @Input() placeholder = '';
  @Input() formGroup: FormGroup | null = null;
  @Input() controlName: string | null = null;
  @Input() labelCode = '';
  @Output() keypressed = new EventEmitter<any>();
  @Output() changed = new EventEmitter<any>();
  
  ngOnInit() {
    if (this.formGroup && this.controlName) {
      const control = this.formGroup.get(this.controlName) as FormControl;
      if (control) {
        this.control = control;
      }

    }
  }

  onKeypressed(ev: KeyboardEvent) {
    this.keypressed.emit(ev);
  }

  onChanged(ev: Event) {
    this.changed.emit(ev);
  }

  get disabled() {
    return this.control?.disabled || false;
  }

  errorMessages: Record<string, string> = ERROR_MESSAGES;

  getErrorMessage(): string {
    if (this.control && this.control.touched && this.control.invalid && this.control.errors) {
      const errorKey = Object.keys(this.control.errors || {})[0];
      if (errorKey === 'maxlength') {
        const max = (Object.values(this.control.errors || {})[0])['requiredLength']
        return this.errorMessages[errorKey] + max || '';
      }
      if (errorKey === 'max') {
        const max = (Object.values(this.control.errors || {})[0])['max']
        if (max == 100) return this.errorMessages['maxPercent'];
      }
      if (errorKey === 'min') {
        const min = (Object.values(this.control.errors || {})[0])['min']
        if (min == 1) return this.errorMessages['min1'];
      }
      if (errorKey === 'pattern') {
        const pattern = (Object.values(this.control.errors || {})[0])['requiredPattern']
        switch (pattern) {
          case '/^[a-zA-Z0-9]*$/':
            return this.errorMessages['patternNumberAndLetters'];
          case '/^[a-zA-Z0-9 ]*$/':
            return this.errorMessages['patternNumberLettersAndSpaces'];
          case '/^\\S+$/':
            return this.errorMessages['patternNoSpaces'];
          case '/^[0-9]+$/':
            return this.errorMessages['patternNumbers'];

          default:
            return this.errorMessages['pattern'];
        }
      }
      return this.errorMessages[errorKey] || '';
    }
    return '';
  }

}
