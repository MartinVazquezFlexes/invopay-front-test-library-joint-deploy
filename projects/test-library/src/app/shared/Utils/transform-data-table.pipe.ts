import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { AmountFormatPipe } from './amount-format-pipe.pipe';

@Pipe({
  name: 'transformDataTable',
})
export class TransformDataTablePipe implements PipeTransform {
  constructor(
    private datePipe: DatePipe,
    private amountFormatPipe: AmountFormatPipe,
    private translate: TranslateService
  ) {}

  transform(data: any, key: string, keyTranslate: string): unknown {
    if (key === 'isActive') {
      return data
        ? this.translate.instant('IP.TABLE.ACTIVE')
        : this.translate.instant('IP.TABLE.INACTIVE');
    }
    if (key === 'isCommissionInvoice') {
      return data
        ? this.translate.instant('IP.TABLE.YES')
        : this.translate.instant('IP.TABLE.NO');
    }
    if(key === 'avatar') return '';
    if (!data) {
      return '-';
    }
    if (key === 'addresses') {
      if (data[0] && data[0].fullAddress) {
        return data[0].fullAddress;
      }
      return '-';
    }
    if (key === 'country') {
      if (data.name) {
        return data.name;
      }
      return '-';
    }
    if (key === 'supplier') {
      return data.businessName ?? 'No name';
    }
    if (key === 'paymentType') {
      return data ===  'TRANSFER' ? this.translate.instant('IP.PAY_IN.METHOD.TRANSFER')
        : data ===  'TICKET' ? this.translate.instant('IP.PAY_IN.METHOD.TICKET')
        : data ===  'CASH' ? this.translate.instant('IP.PAY_IN.METHOD.CASH')
        : data ===  'CHECK' ? this.translate.instant('IP.PAY_IN.METHOD.CHECK')
        : '-';
    }
    if (key === 'userStatus') {
      if (data === 'ACTIVATED') {
        return this.translate.instant(
          'IP.USER_FORM_MODAL.USER_STATE.ACTIVATED'
        );
      }
      if (data === 'DISABLED') {
        return this.translate.instant('IP.USER_FORM_MODAL.USER_STATE.DISABLED');
      }
      return 'N/A';
    }
    if (key === 'cardNumber') {
      const cardNumberParts = [];
      for (let i = 0, j = 0; i < 4; i++) {
        cardNumberParts[i] = data.substring(j, j + 4);
        j += 4;
      }
      return '···· ' + cardNumberParts[3];
    }
    if (data && (key.includes('Date') || key.includes('Time'))) {
      if (this.isDate(data)) {
        if (key === 'dateTime') {
          return this.datePipe.transform(data, 'dd/MM/yy - h:mm.ss');
        }
        return this.datePipe.transform(data, 'dd/MM/yy');
      }
      return data;
    }
    if ((key.includes('datePayIn'))) {
      if (data.includes(' - ')) {
        const dates = data.split(' - ')
        return `${dates[0]}  ${dates[1]}`
      }
      return data;
    }
    if (
      key === 'id' ||
      key === 'contractId' ||
      key === 'purchaseId' ||
      key === 'Id'
    ) {
      return `#${data}`;
    }
    if (
      (key.includes('amount') || key.includes('Amount')) &&
      this.isAmount(data)
    ) {
      return this.amountFormatPipe.transform(data);
    }
    if ((key.includes('name') || key.includes('Name')) && data.length > 40) {
      return data.slice(0, 37) + '...';
    }
    if (key.includes('status') && data.length > 24) {
      return data.slice(0, 21) + '...';
    }
    if (key === 'status'){
      return data === 'PAID' 
        ? this.translate.instant('IP.TABLE.CONSOLIDATED.PAID')
        : data === 'GENERATED' 
          ? this.translate.instant('IP.TABLE.CONSOLIDATED.GENERATED')
          : data
    }
    if (key === 'payOrigin'){
      return data === 'CONCILIATION' 
        ? this.translate.instant('IP.TABLE.CONSOLIDATED.PAY_IN.CONCILIATION')
        : data === 'MANUAL' 
        ? this.translate.instant('IP.TABLE.CONSOLIDATED.PAY_IN.MANUAL')
        : data === 'ONLINE' 
        ? this.translate.instant('IP.TABLE.CONSOLIDATED.PAY_IN.ONLINE')
        : data
    }
    if (key.includes('description') && data.length > 28) {
      return data.slice(0, 25) + '...';
    }
    if (key.includes('dataConcept') && data.length > 28) {
      return data.slice(0, 25) + '...';
    }
    if (key.includes('comment') && data.length > 33) {
      return data.slice(0, 30) + '...';
    }
    if (key.includes('observation') && data.length > 58) {
      return data.slice(0, 55) + '...';
    }
    if (key === 'movementType') {
      if (data === 'Credito') {
        return this.translate.instant('IP.FINANCES.MOVEMENT_TYPES.CREDIT');
      }
      if (data === 'Debit') {
        return this.translate.instant('IP.FINANCES.MOVEMENT_TYPES.DEBIT');
      }
    }
    if (key === 'periodMilliseconds') {
      return this.periodMilliseconds(data);
    }
    const dataTranslate = this.getTranslate(data + '', keyTranslate);
    return dataTranslate ? dataTranslate : data;
  }

  private isDate(data: string): boolean {
    if (typeof data !== 'string') {
      return false;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const slicedDate = data.slice(0, 10);
    return dateRegex.test(slicedDate);
  }

  // private isDate(data : any) : boolean{
  //   const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  //   const date = new Date(data);
  //   return !isNaN(date.getTime()) && isNaN(data) && dateRegex.test(data);
  // }

  private isAmount(data: any): boolean {
    return !isNaN(data) && typeof data != 'string';
  }

  private getTranslate(key: string, keyTranslate: string): string | undefined {
    const fullKey: string = keyTranslate + '.' + key.toUpperCase();
    const translate: string = this.translate.instant(fullKey);
    return translate == fullKey ? undefined : translate;
  }

  private periodMilliseconds(milliseconds: number | string): string {
    if (typeof milliseconds === 'string') {
      milliseconds = parseInt(milliseconds, 10);
    }
    const seconds = Math.floor((milliseconds / 1000) % 60);
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
    return `${hours}h ${minutes}m ${seconds}s`;
  }
}

