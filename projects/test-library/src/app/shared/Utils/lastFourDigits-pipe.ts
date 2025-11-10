import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lastFourDigits',
})
export class LastFourDigitsPipe implements PipeTransform {
  transform(value: number | string): string {
    const stringValue = typeof value === 'number' ? value.toString() : value;
    if (stringValue.length >= 4) {
      return stringValue.slice(-4);
    } else {
      return stringValue;
    }
  }
}
