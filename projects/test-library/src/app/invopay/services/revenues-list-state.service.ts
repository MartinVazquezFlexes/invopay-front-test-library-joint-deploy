import { Injectable } from '@angular/core';
import { RevenueListState } from '../interface/revenueListState';


@Injectable({
  providedIn: 'root'
})
export class RevenuesListStateService {

  constructor() { }
   private state: RevenueListState|null = null
  
    saveState(state: RevenueListState): void {
      this.state = state
    }
  
    getState(): RevenueListState|null {
      return this.state;
    }
  
    clearState(): void {
      this.state = null
    }
}
