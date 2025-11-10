import { Component, computed, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-ip-input',
  templateUrl: './ip-input.component.html',
  styleUrls: ['./ip-input.component.scss']
})
export class IpInputComponent {
  @Input() inputId = '';
  @Input() control = new FormControl();
  @Input() label = '';
  @Input() type: 'text' | 'email' | 'number' = 'text';
  @Input() placeholder = '';
  @Output() keypressed = new EventEmitter<any>();
  @Output() changed = new EventEmitter<any>();

  disabled = computed(() => this.control.disabled);
  
  onKeypressed(ev:KeyboardEvent) {
    this.keypressed.emit(ev);
  }

  onChanged(ev:Event) {
    this.changed.emit(ev);
  }

  errorMessages: Record<string,string>={
    required:'IP.VALIDATORS.REQUIRED',
    whitespace:'IP.VALIDATORS.REQUIRED',
    maxlength:'IP.VALIDATORS.STRING_TOO_LARGE-',
    patternNumberAndLetters: "IP.VALIDATORS.ONLY_NUMBERS_AND_LETTERS",
    patternNumberLettersAndSpaces: "IP.VALIDATORS.ONLY_NUMBERS_LETTERS_AND_SPACES",
    patternNoSpaces: "IP.VALIDATORS.NO_SPACES",
    patternNumbers: "IP.VALIDATORS.ONLY_NUMBERS",
    pattern: "IP.VALIDATORS.INVALID_FORMAT",
    amountFormat: "IP.VALIDATORS.INVALID_FORMAT",
    max: "IP.VALIDATORS.AMOUNT_TOO_BIG",
    min: "IP.VALIDATORS.PERCENTAGE_TOO_LOW",
    min1: "IP.VALIDATORS.VALUE_TOO_LOW",
    maxPercent: "IP.VALIDATORS.PERCENTAGE_TOO_HIGH",
    email: "IP.VALIDATORS.EMAIL"
  }

  getErrorMessage(): string {
    if (this.control.touched && this.control.invalid && this.control.errors) {
      const errorKey = Object.keys(this.control.errors || {})[0]; 
      if (errorKey === 'maxlength'){
        const max = (Object.values(this.control.errors|| {})[0])['requiredLength']
        return this.errorMessages[errorKey] + max || '';
      }
      if (errorKey === 'max'){
        const max = (Object.values(this.control.errors|| {})[0])['max']
        if (max == 100) return this.errorMessages['maxPercent'];
      }
      if (errorKey === 'min'){
        const min = (Object.values(this.control.errors|| {})[0])['min']
        if (min == 1) return this.errorMessages['min1'];
      }
      if (errorKey === 'pattern'){
        const pattern = (Object.values(this.control.errors|| {})[0])['requiredPattern']
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
