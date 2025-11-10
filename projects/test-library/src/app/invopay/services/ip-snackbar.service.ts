import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import {
  IpErrorSnackBarComponent
} from '../components/ip-error-snack-bar/ip-error-snack-bar.component';
import {
  IpSuccessSnackBarComponent
} from '../components/ip-success-snack-bar/ip-success-snack-bar.component';
import IpErrorResponse from '../interface/ip-error-response';


@Injectable({
  providedIn: 'root'
})
export class IpSnackbarService {
  private snackBarRef?: MatSnackBarRef<
    IpErrorSnackBarComponent |
    IpSuccessSnackBarComponent
  >;

  constructor(private snackBar: MatSnackBar) { }

  showSuccessMessage(
    description: string = 'Operación exitosa.',
    title: string = 'Éxito'
  ) {
    this.snackBarRef = this.snackBar.openFromComponent(
      IpSuccessSnackBarComponent, {
      data: {
        title,
        description,
        isSticky: true,
      },
      duration: 5000,
      panelClass: ['my-snackbar', 'success-snackbar'],
      verticalPosition: 'top',
    });
  }

  showErrorMessage(errorResponse: IpErrorResponse, isSticky = false) {
    let title = 'Error';
    let description = 'Error no controlado.';
    const errorSource = errorResponse.error?.source;
    if (errorSource) {
      if (errorSource === 'Base' || errorSource === 'Invopay') {
        const errorTitle = errorResponse.error.title;
        const errorDescription = errorResponse.error.description;
        if (errorTitle && errorDescription) {
          title = errorTitle;
          description = errorDescription;
        }
        else {
          description = 'Algo salió mal.';
        }
      }
      else {
        console.warn('Unrecognized error source.');
        description = 'Error desconocido.';
      }
    }
    this.snackBarRef = this.snackBar.openFromComponent(
      IpErrorSnackBarComponent, {
      data: {
        title,
        description,
        isSticky,
      },
      duration: 5000,
      panelClass: ['my-snackbar', 'error-snackbar'],
      verticalPosition: 'top',
    });
  }

  showCustomErrorMessage(title: string, description: string, isSticky = false) {
    this.snackBarRef = this.snackBar.openFromComponent(
      IpErrorSnackBarComponent, {
      data: {
        title,
        description,
        isSticky,
      },
      duration: 5000,
      panelClass: ['my-snackbar', 'error-snackbar'],
      verticalPosition: 'top',
    });
  }

  showUnexpectedErrorMessage() {
    this.showCustomErrorMessage(
      'Error inesperado',
      'Algo no salió como esperábamos.'
    );
  }

  dismissMessage() {
    this.snackBarRef?.dismiss();
  }

  dismissNotStickyMessage() {
    if (this.snackBarRef?.instance.data.isSticky) {
      return;
    }
    this.snackBarRef?.dismiss();
  }
}
