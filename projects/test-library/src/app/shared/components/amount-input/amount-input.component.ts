import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-amount-input',
  templateUrl: './amount-input.component.html',
  styleUrls: ['./amount-input.component.scss'],
  standalone: true,
  imports: [FormsModule],
})
export class AmountInputComponent implements  OnInit{
  @Input() form?: FormGroup;
  @Input() controlName?: string;
  @Input() label?: string;
  @Input() currency?: string;


  ngOnInit(): void {
    const amountControl = this.form?.get(this.controlName!);
    if (amountControl && amountControl.value !== null) {
      this.rawValue = amountControl.value.toString();
    }
  }

  private rawValue: string = '';
  private debounceTimeout: any;

  private getLocale(): string {
    switch (this.currency) {
      case 'ARS':
        return 'es-AR';
      case 'USD':
        return 'en-US';
      case 'CLP':
        return 'es-CL';
      case 'BRL':
        return 'pt-BR';
      default:
        return 'en-US';
    }
  }

  // formatValue() {
  //   if (!this.rawValue) {
  //     this.setControlValue(0);
  //     return;
  //   }

  //   const numericValue = parseFloat(this.rawValue) / 100;
  //   const formatted = numericValue.toLocaleString(this.getLocale(), {
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: 2,
  //   });

  //   this.setControlValue(numericValue);
  //   this.rawValue = formatted;
  // }

  // Formatear el valor
  private formatValue(value: string): string {
    const decimalSeparator = this.getDecimalSeparator();
    const numericValue = parseFloat(value.replace(decimalSeparator, '.'));

    if (!isNaN(numericValue)) {
      return numericValue.toLocaleString(this.getLocale(), {
        minimumFractionDigits: value.includes(decimalSeparator) ? 2 : 0,
        maximumFractionDigits: value.includes(decimalSeparator) ? 2 : 0,
      });
    }

    return '0.00';
  }

  private setControlValue(value: number): void {
    const amountControl = this.form?.get(this.controlName!);
    amountControl?.setValue(value);
  }

  private getDecimalSeparator(): string {
    switch (this.currency) {
      case 'ARS':
      case 'CLP':
      case 'BRL':
        return ',';
      case 'USD':
      default:
        return '.';
    }
  }

  // Detectar cambios en el valor ingresado (sin formatear todavía)
  onAmountChange(event: Event): void {
    
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;

    const decimalSeparator = this.getDecimalSeparator();
    const regex = new RegExp(`[^0-9\\${decimalSeparator}]`, 'g');

    // Mantener el valor sin formatear durante la escritura
    this.rawValue = value.replace(regex, '');

    // Actualizar el valor en el input
    inputElement.value = this.rawValue;
    console.log(this.rawValue);
    
  }

  validateFormat(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
      'Enter',
    ];
    const regex = /^[0-9,.]$/;

    if (!allowedKeys.includes(event.key) && !regex.test(event.key)) {
      event.preventDefault();
    }
  }

  get formattedAmount(): string {
    const amountControl = this.form?.get(this.controlName!);
    return (
      amountControl?.value.toLocaleString(this.getLocale(), {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) || '0.00'
    );
  }

  // Manejar el evento blur (cuando el input pierde el foco)
  onBlur(event: FocusEvent): void {
    
    const inputElement = event.target as HTMLInputElement;
    const formattedValue = this.formatValue(this.rawValue);

    // Actualizar el control del formulario
    const amountControl = this.form?.get(this.controlName!);
    const numericValue = parseFloat(
      this.rawValue.replace(this.getDecimalSeparator(), '.')
    );
    
    if (!isNaN(numericValue)) {
      amountControl?.setValue(numericValue);
    } else {
      amountControl?.setValue(0);
    }

    // Establecer el valor formateado en el input
    inputElement.value = formattedValue;
  }
}
