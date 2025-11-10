import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: 'app-filter-modal-mobile',
  templateUrl: './filter-modal-mobile.component.html',
  styleUrls: ['./filter-modal-mobile.component.scss']
})
export class FilterModalMobileComponent {



  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

   closeModal() {
    this.closed.emit();
  }


}
