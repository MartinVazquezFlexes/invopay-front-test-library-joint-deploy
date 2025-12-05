import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
})
export class PaginatorComponent implements OnInit, OnChanges {
  ngOnInit(): void {
    this.itemsView = this.itemsPerPage;
  }
  @Input() totalItems!: number;
  @Input() itemsPerPage!: number;
  @Input() currentPages: number = 1;
  @Input() backgroundColor: string = 'transparent';
  @Output() pageChange = new EventEmitter<number>();
  items!: number;
  originalItems: boolean = true;
  currentPage = this.currentPages;
  nextPage = this.currentPage + 1;
  nextnextPage = this.currentPage + 2;
  itemsView!: number;
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.nextPage = this.currentPage + 1;
      this.nextnextPage = this.currentPage + 2;
      this.pageChange.emit(this.currentPage);
      this.viewItems();
    }
  }

  viewItems() {
    this.itemsView = this.currentPage * this.itemsPerPage;
    if (this.itemsView > this.totalItems) {
      this.itemsView = this.totalItems;
    }
  }
  ngOnChanges(change: SimpleChanges) {
    if (this.originalItems) {
      this.items = this.itemsPerPage;
      this.originalItems = false;
    }
    if (this.totalItems < this.itemsPerPage) {
      this.itemsPerPage = this.totalItems;
    } else {
      this.itemsPerPage = this.items;
    }
    this.currentPage = this.currentPages;
    this.nextPage = this.currentPage + 1;
    this.nextnextPage = this.currentPage + 2;
    // // This was calling it's parent ip-table's "executeService" method twice.
    // // Double-check
    // this.pageChange.emit(this.currentPage);

    this.viewItems();
  }
}
