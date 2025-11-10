import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class MatDialogService {

  private openDialogs: MatDialogRef<any>[] = [];

  constructor(private dialog: MatDialog) {}

  openDialog(component: any, options?: any): MatDialogRef<any> {
    const dialogRef = this.dialog.open(component, options);
    this.openDialogs.push(dialogRef);
    return dialogRef;
  }

  closeAllDialogs() {
    this.openDialogs.forEach(dialogRef => dialogRef.close());
    this.openDialogs = [];
  }
}
