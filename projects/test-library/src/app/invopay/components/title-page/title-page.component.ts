import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-title-page',
  templateUrl: './title-page.component.html',
  styleUrls: ['./title-page.component.scss']
})
export class TitlePageComponent {


  @Input() title: string = '';
  @Input() showBackButton: boolean = false;
  @Input() isMobile:boolean =false;
  @Output() backButtonClick = new EventEmitter<void>();

  constructor() {}

  onClickButton(): void {
    console.log("click");
    this.backButtonClick.emit();
  }
}