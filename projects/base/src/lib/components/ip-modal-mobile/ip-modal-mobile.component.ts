import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-ip-modal-mobile',
  templateUrl: './ip-modal-mobile.component.html',
  styleUrls: ['./ip-modal-mobile.component.scss'],
  animations: [
    trigger('slideUp', [
      state('void', style({ transform: 'translateY(100%)', opacity: 0 })),
      state('in', style({ transform: 'translateY(0)', opacity: 1 })),
      transition('void => in', [animate('200ms ease-out')]),
      transition('in => void', [animate('200ms ease-in')]),
    ])
  ]
})
export class IpModalMobileComponent implements OnInit {
  mobile!:boolean;
  @Input() title: string = 'TITLE NULL';
  @Output() close: EventEmitter<any> = new EventEmitter();
  @Input() showTitle: boolean = true;
  @Input() showCloseModal?: boolean = true;
  @Input() contentStyle?: string;
  modalVisible: boolean=false;

  ngOnInit() {
    this.checkIfMobile()
    if (this.mobile) {
      setTimeout(() => {
        this.modalVisible = true;
      }, 200);
    } else {
      this.modalVisible = true;
    }
  }

  @HostListener('window:resize', [])
  checkIfMobile() {
    this.mobile = window.innerWidth < 768;
  }

  closeModal(): void {
    this.modalVisible = false
    setTimeout(() => {
      this.close.emit();      
    }, 200);
  }
}

