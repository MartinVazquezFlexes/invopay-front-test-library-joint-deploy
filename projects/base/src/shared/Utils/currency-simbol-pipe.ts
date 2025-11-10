import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencySymbol'
})
export class CurrencySymbolPipe implements PipeTransform {
  transform(currencyCode: string): string {
    switch (currencyCode) {
      case 'USD':
        return '$';
      case 'ARS':
        return '$';
      case 'EURO':
        return '€';
      case 'JPY':
          return'¥';
      default:
        return currencyCode; 
    }
  }
}