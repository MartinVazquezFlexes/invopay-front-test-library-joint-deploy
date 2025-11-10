import { NgIf } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  standalone: true,
  imports: [FormsModule, NgIf],
  selector: 'app-ip-search-input',
  templateUrl: './ip-search-input.component.html',
  styleUrls: ['./ip-search-input.component.scss'],
})
export class IpSearchInputComponent {
  @Input() placeholder: string = '';
  @Input() searchValue: string = '';
  @Output() onSearch = new EventEmitter<string>();
  @Input() hidePrefix: boolean = false;
  @Input() isKeyUp: boolean = false;

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    this.updatePlaceholder(window.innerWidth);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updatePlaceholder(event.target.innerWidth);
  }

  updatePlaceholder(width: number) {
    if (width < 768) {
      this.placeholder = 'Buscar';
    } else {
      this.translate
        .get(this.placeholder)
        .subscribe((res: string) => (this.placeholder = res));
    }
  }
}
