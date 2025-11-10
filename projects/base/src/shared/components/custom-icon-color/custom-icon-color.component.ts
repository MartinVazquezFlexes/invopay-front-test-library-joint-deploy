import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-custom-icon-color',
  templateUrl: './custom-icon-color.component.html',
  styleUrls: ['./custom-icon-color.component.scss'],
})
export class CustomIconColorComponent {
  @Input() iconName!: string;
  @Input() height: string = '16px';
  @Input() width: string = '16px';
}
