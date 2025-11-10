
import { Component, Inject, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

type SuccessMessage = { title?: string, description: string, isSticky: boolean };

@Component({
  selector: 'app-ip-success-snack-bar',
  templateUrl: './ip-success-snack-bar.component.html',
  styleUrls: ['./ip-success-snack-bar.component.scss']
})
export class IpSuccessSnackBarComponent {
  snackBarRef = inject(MatSnackBarRef);

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: SuccessMessage,
  ) { }

}
