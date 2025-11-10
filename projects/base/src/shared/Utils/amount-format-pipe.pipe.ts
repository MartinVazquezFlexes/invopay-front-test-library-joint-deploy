import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'amount'
})
export class AmountFormatPipe implements PipeTransform {

  transform(
    value: number | string,
    isCommaFloat = true,
    symbol = '',
    currencyCode?: string
  ): string {
    let centsDivider = '.';
    let thousandsDivider = ',';
    if (isCommaFloat) {
      centsDivider = ',';
      thousandsDivider = '.';
    }
    // If the value is not set
    if (!value) {
      // Returns a default value
      return currencyCode ? currencyCode + ' ' + symbol + ' 0' + centsDivider + '00' : symbol + ' 0' + centsDivider + '00';
    }
    // If the value is a string but not a number
    if (typeof (value) === 'string') {
      value = Number(value);
      if (isNaN(value)) {
        // Returns a default value
        return currencyCode ? currencyCode + ' ' + symbol + ' 0' + centsDivider + '00' : symbol + ' 0' + centsDivider + '00';
      }
    }
    // Otherwise, we format the amount
    const parts = value.toFixed(2).toString().split('.');
    const integerPart = parts[0].replace(
      /\B(?=(\d{3})+(?!\d))/g,
      thousandsDivider
    );
    const decimalPart = parts.length > 1 ? centsDivider + parts[1] : '';
    const symbolAndParts = symbol + ' ' + integerPart + decimalPart;
    if (currencyCode) {
      return currencyCode + ' ' + symbolAndParts;
    }
    return symbolAndParts;
  }
}
