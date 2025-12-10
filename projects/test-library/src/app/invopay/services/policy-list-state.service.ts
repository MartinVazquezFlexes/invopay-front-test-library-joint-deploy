import { Injectable } from '@angular/core';
import { SaleListState } from '../interface/saleListState';
import { PolicyListState } from '../interface/policyListState';

@Injectable({
  providedIn: 'root'
})
export class PolicyListStateService {

 private state: PolicyListState|null = null

  saveState(state: PolicyListState): void {
    this.state = state
  }

  getState(): PolicyListState|null {
    return this.state;
  }

  clearState(): void {
    this.state = null
  }
}
