import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'customDate',
})
export class CustomDatePipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}

  transform(value: Date | string, showTime = false): string {
    if (!value) {
      return '';
    }

    if (showTime) {
      return this.datePipe.transform(value, 'dd/MM/yy - h:mm.ss') || '';
    }

    if (typeof value === 'string') {
      value = this.convertToDate(value);
    }

    if (typeof value !== 'string') {
      const day = this.padZero(value.getDate());
      const month = this.padZero(value.getMonth() + 1);
      const year = this.padZero(value.getFullYear() % 100);

      return `${day}/${month}/${year}`;
    } else return value
    return '';
  }

  transformDateTime(value: Date | string): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      value = this.convertToDate(value);
    }

    return this.datePipe.transform(value, 'dd/MM/yyyy - H:mm:ss') || '';
  }

  private padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  convertToDate(dateString: string): Date | string {
    if (dateString) {
      const parts = dateString.split('-');
      if (parts.length < 3) return dateString;
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const day = parseInt(parts[2]);
      return new Date(year, month, day);
    } else {
      return '';
    }
  }
}
