import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ip-title-mobile',
  templateUrl: './ip-title-mobile.component.html',
  styleUrls: ['./ip-title-mobile.component.scss']
})
export class IpTitleMobileComponent implements OnInit {
  @Input() title = '';
  @Input() btn: 'create' | 'filter' | 'none' = 'none';
  @Input() btnText?: string;
  @Input() back = false;
  @Output() clicked = new EventEmitter<any>();
  mobile!:boolean;
  
  constructor(private location: Location) {}

  ngOnInit(): void {
    this.checkIfMobile()
  }

  onClickButton(ev: MouseEvent) {
    this.clicked.emit(ev);
  }

  goBack() {
    this.location.back();
  }

  @HostListener('window:resize', ['$event'])
  checkIfMobile() {
    this.mobile = window.innerWidth < 768;
  }

}
