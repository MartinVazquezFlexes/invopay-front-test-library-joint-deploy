import { Component, Inject, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

type ErrorMessage = { title: string, description: string, isSticky: boolean };

@Component({
  selector: 'app-ip-error-snack-bar',
  templateUrl: './ip-error-snack-bar.component.html',
  styleUrls: ['./ip-error-snack-bar.component.scss']
})
export class IpErrorSnackBarComponent {
  snackBarRef = inject(MatSnackBarRef);

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: ErrorMessage,
  ) { }

}
