import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SchemeService } from '../../services/scheme.service';
import { Scheme, SchemeParameters } from '../../interface/scheme';


export type SchemaContext = 'detail' | 'status';

@Component({
  selector: 'app-modal-schema',
  templateUrl: './modal-schema.component.html',
  styleUrls: ['./modal-schema.component.scss'],
})
export class ModalSchemaComponent implements OnInit {
  constructor() {}

  private readonly schemeService = inject(SchemeService);

  @Input() schemaToDetail: any;
  @Input() context: SchemaContext = 'detail';
  @Output() close = new EventEmitter<void>();
  @Output() updateTable = new EventEmitter<void>();

  //Creo los controls
  detailedInfoForm: FormGroup = new FormGroup({
    schemeName: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ),
    shortDescription: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ),
    fullDescription: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ),
    isSchemaActive: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ),
    schemaStatus: new FormControl(
      { value: '', disabled: true },
      Validators.required
    ),
  });

  ngOnInit() {
    this.setFormValues();
  }

  setFormValues() {
    //if (!this.revenueDetailsFormatted) return;

    this.detailedInfoForm.patchValue({
      //transaccion
      schemeName: this.schemaToDetail.name || '',
      shortDescription: this.schemaToDetail.description || '',
      fullDescription: this.schemaToDetail.longDescription || '',
      isSchemaActive: this.schemaToDetail.isActive || '',
      schemaStatus: this.getStatusText(this.schemaToDetail.isActive),
    });
  }

  private getStatusText(isActive: boolean | null | undefined): string {
    if (isActive === null || isActive === undefined) {
      return 'Sin definir';
    }
    return isActive ? 'Activo' : 'Inactivo';
  }

  getControl(controlName: string): FormControl {
    return this.detailedInfoForm.get(controlName) as FormControl;
  }

  responseUpdate: any;
  updateStatus() {
    console.log('Id: ', this.schemaToDetail.id);
    this.schemeService.patchScheme(this.schemaToDetail.id).subscribe({
      next: (response) => {
        this.responseUpdate = response;
        console.log('Estado actualizado: ', this.responseUpdate);

        //despues de la actualizacion
        this.updateTable.emit();
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
      },
    });
  }

  closeModal() {
    this.close.emit();
  }
}
