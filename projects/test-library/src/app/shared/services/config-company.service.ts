import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigCompanyService {
  private companyLogo: string = '';
  private companyName: string = 'Finsuite';
  private lastUpdate: string = '12/03/2023';
  constructor() {}

  getLogo(): string {
    return this.companyLogo;
  }
  getName(): string {
    return this.companyName;
  }
  getLastUpdate(): string {
    return this.lastUpdate;
  }



}
