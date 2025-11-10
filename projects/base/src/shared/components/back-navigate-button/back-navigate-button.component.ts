import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-navigate-button',
  templateUrl: './back-navigate-button.component.html',
  styleUrls: ['./back-navigate-button.component.scss'],
})
export class BackNavigateButtonComponent {
  @Input() returnUrl: string = '/';
  @Input() backLabel: string = '';
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate([this.returnUrl]);
  }
}
