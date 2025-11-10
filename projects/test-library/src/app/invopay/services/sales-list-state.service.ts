import { Injectable } from '@angular/core';
import { SaleListState } from '../interface/saleListState';

@Injectable({
  providedIn: 'root'
})
export class SalesListStateService {

 private state: SaleListState|null = null

  saveState(state: SaleListState): void {
    this.state = state
  }

  getState(): SaleListState|null {
    return this.state;
  }

  clearState(): void {
    this.state = null
  }
}



