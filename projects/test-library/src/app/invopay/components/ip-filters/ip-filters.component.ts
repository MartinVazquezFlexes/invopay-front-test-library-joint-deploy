import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import FilterValues from '../../interfaces/ip-filter-values';
import { filter } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    MatFormFieldModule,
  ],
  selector: 'app-ip-filters',
  templateUrl: './ip-filters.component.html',
  styleUrls: ['./ip-filters.component.scss'],
})
export class IpFiltersComponent implements OnInit {
  @Input() service!: string;
  @Input() filters!: Array<[string, string]>;
  @Input() filterValues?: FilterValues;
  @Input() onlyLast30days: boolean = false;
  @Output() close: EventEmitter<undefined> = new EventEmitter<undefined>();
  @Output() applyFilters: EventEmitter<any> = new EventEmitter<any>();
  form!: FormGroup;
  maxDate!: string;
  minEndDate!: string;
  maxEndDate!: string;
  dateFrom!: string;
  dateTo!: string;
  minAmountTo: number = 0;
  amountToValidate: boolean = false;

  get amountFrom() {
    return this.form.get('amountFrom');
  }

  get amountTo() {
    return this.form.get('amountTo');
  }

  get createDateFrom() {
    return this.form.get('createDateFrom');
  }

  get createDateTo() {
    return this.form.get('createDateTo');
  }

  constructor(private fb: FormBuilder) {
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
    this.maxEndDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    if (this.filterValues?.createDateFrom) {
      this.dateFrom = new Date(this.filterValues?.createDateFrom)
        .toISOString()
        .split('T')[0];
    }
    if (this.filterValues?.createDateTo) {
      this.dateTo = this.formatDateArg(new Date(this.filterValues?.createDateTo));
    }
    console.log(this.filterValues?.createDateTo);
    
    this.form = this.fb.group({
      amountFrom: [
        this.filterValues?.amountFrom,
        this.amountValidators.bind(this),
      ],
      amountTo: [this.filterValues?.amountTo, this.amountValidators.bind(this)],
      createDateFrom: [this.dateFrom],
      createDateTo: [this.dateTo],
    });
    console.log(this.createDateFrom?.value);
  }

  // addStartDate(type: string, event: MatDatepickerInputEvent<Date>) {
  //   this.start?.setValue(event.value);
  //   const startDate = new Date(this.start?.value);

  //   startDate.setDate(startDate.getDate() + 1);

  //   this.minEndDate = startDate.toISOString().split('T')[0];
  // }

  // addEndDate(type: string, event: MatDatepickerInputEvent<Date>) {
  //   this.end?.setValue(event.value);
  // }

  onStartDateChange() {
    if (this.createDateFrom) {
      const startDate = new Date(this.createDateFrom?.value);
      const endDate = new Date(this.createDateTo?.value);
      const dateToday = new Date();
      const maxDateToVar = new Date(startDate);
      const dateInSixMonth = new Date(maxDateToVar.setMonth(startDate.getMonth() + 6));
      // startDate.setDate(startDate.getDate() + 1);

      this.minEndDate = startDate.toISOString().split('T')[0];
      if(dateInSixMonth < dateToday){
        this.maxEndDate = maxDateToVar.toISOString().split('T')[0];
        const formattedDate = dateInSixMonth.toISOString().split('T')[0];
        this.createDateTo?.setValue(formattedDate);
      }
      else{
        if(this.createDateTo?.value != "" && endDate >= startDate){
          
        }
        else{
          this.createDateTo?.setValue(this.maxDate);
        }
        this.maxEndDate = this.maxDate;
      }
    } else {
      this.createDateTo?.setValue('');
    }
  }

  validateFormat(event: any) {
    let inputValue: string;
    this.minAmountTo = this.amountFrom?.value;
    
    if (event.type === 'paste') {
      inputValue = event.clipboardData.getData('text/plain');
    } else {
      const key = event.keyCode;
      inputValue = String.fromCharCode(key);
    }

    const regex = /^[0-9]*\.?[0-9]*$/;

    if (!regex.test(inputValue)) {
      event.returnValue = false;
      if (event.preventDefault) {
        event.preventDefault();
      }
    }
  }

  inputChangeAmountFrom(event: any){
    if(this.amountTo?.value != undefined && this.amountFrom?.value > this.amountTo?.value){
      this.amountFrom?.setValue(this.amountTo?.value);
    }
    this.minAmountTo = this.amountFrom?.value;
  }

  inputChangeAmountTo(event: any){
    
    if(this.amountTo?.value != undefined && this.amountFrom?.value > this.amountTo?.value){
      this.amountToValidate = true;
    }
    else{
      this.amountToValidate = false;
    }
  }

  amountValidators(formGroup: FormGroup) {
    const amountTo = formGroup.get('amountTo')?.value;
    const amountFrom = formGroup.get('amountFrom')?.value;
    if (
      (amountTo === undefined && amountFrom === undefined) ||
      (amountTo === null && amountFrom === null) ||
      (amountTo === null && amountFrom !== null && amountFrom > 0) ||
      (amountFrom === null && amountTo !== null && amountTo > 0) ||
      (amountTo !== null &&
        amountFrom !== null &&
        amountTo >= 0 &&
        amountFrom >= 0 &&
        amountFrom <= amountTo)
    ) {
      return null;
    } else {
      return { invalidNumberAmount: true };
    }
  }

  // dateRangeValid(formGroup: AbstractControl): { [key: string]: any } | null {
  //   const start = formGroup.get('start')?.value;
  //   const end = formGroup.get('end')?.value;

  //   if (start !== null && end === null) {
  //     return start && end ? null : { dateRangeIncomplete: true };
  //   }
  //   return null;
  // }

  // dateValidators(formGroup: FormGroup) {
  //   const dateTo = formGroup.get('end')?.value;
  //   const dateFrom = formGroup.get('start')?.value;
  //   if (
  //     (dateTo === undefined && dateFrom === undefined) ||
  //     (dateTo === null && dateFrom === null) ||
  //     (dateTo !== null && dateFrom !== null && dateTo >= dateFrom)
  //   ) {
  //     return null;
  //   } else {
  //     return { invalidDates: true };
  //   }
  // }

  formValidators(formGroup: FormGroup) {
    const amountTo = formGroup.get('amountTo')?.value;
    const amountFrom = formGroup.get('amountFrom')?.value;
    const createDateTo = formGroup.get('createDateTo')?.value;
    const createDateFrom = formGroup.get('createDateForm')?.value;
    if (
      amountFrom == undefined &&
      amountTo == undefined &&
      createDateTo == undefined &&
      createDateFrom == undefined
    ) {
      return { invalidForm: true };
    } else {
      return null;
    }
  }

  onSubmit() {
    let filters: any = {};
    if (
      this.form.get('createDateTo')?.value &&
      this.form.get('createDateFrom')?.value
    ) {
      const endValue = this.form.get('createDateTo')?.value;
      if (endValue) {
        const fecha = new Date(endValue);
        const fechaISO = fecha.toISOString().slice(0, 10);
        filters.dateTo = fechaISO + 'T23:59:59';
      }
      const startValue = this.form.get('createDateFrom')?.value;
      if (startValue) {
        const fecha = new Date(startValue);
        const fechaISO = fecha.toISOString().slice(0, 10);
        filters.dateFrom = fechaISO + 'T00:00:00';
      }
    }

    if (this.form.get('createDateFrom')?.value) {
      const fecha = new Date(this.form.get('createDateFrom')?.value);
      const fechaISO = fecha.toISOString().slice(0, 10);
      filters.dateFrom = fechaISO + 'T00:00:00';
    }

    if (this.form.get('createDateTo')?.value) {
      const fecha = new Date(this.form.get('createDateTo')?.value);
      const fechaISO = fecha.toISOString().slice(0, 10);
      filters.dateTo = fechaISO + 'T23:59:59';
    }

    if (this.form.get('amountFrom')?.value) {
      filters.amountFrom = this.form.get('amountFrom')?.value;
    }
    if (this.form.get('amountTo')?.value) {
      filters.amountTo = this.form.get('amountTo')?.value;
    }
    
    this.applyFilters.emit(filters);
    this.close.emit();
  }

  onClose() {
    this.close.emit();
  }

  resetForm(event: Event) {
    event.preventDefault();
    this.form.controls['createDateFrom'].setValue('');
    this.form.controls['createDateTo'].setValue('');
    this.form.controls['amountTo'].setValue('');
    this.form.controls['amountFrom'].setValue('');
  }

  formatDateArg(date: Date){
    // const today = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Sumar 1 porque getMonth() devuelve 0-11
    const day = String(date.getDate()).padStart(2, '0');

   return `${year}-${month}-${day}`;
  }
}
