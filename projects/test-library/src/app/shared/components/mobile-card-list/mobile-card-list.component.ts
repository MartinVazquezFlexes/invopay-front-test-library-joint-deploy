import { Component, Input, Output, EventEmitter } from '@angular/core';
;
import { CardConfig } from '../../models/movile-table';


@Component({
  selector: 'app-mobile-card-list',
  templateUrl: './mobile-card-list.component.html',
  styleUrls: ['./mobile-card-list.component.scss']
})
export class MobileCardListComponent {
  @Input() data: any[] = [];
  @Input() config!: CardConfig;
  @Input() showNoData: boolean = false;
  @Output() cardAction = new EventEmitter<any>();

  showMenuForItem: any = null;

  toggleMenu(item: any): void {
    this.showMenuForItem = this.showMenuForItem === item ? null : item;
  }

  onCardAction(item: any, action: string): void {
    this.showMenuForItem = null; 
    if (this.config?.actions && this.config.actions.length > 1) {
      this.cardAction.emit({ item, action });
    } else {
      this.cardAction.emit(item);
    }
  }
}
export { CardConfig };

