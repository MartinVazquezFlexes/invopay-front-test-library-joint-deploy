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

  @Input() schemaId: number = 0;
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
    this.getSchemaDetail();
  }

  //schemaDetail = {};
  schemeParameters: SchemeParameters = {
    percentage: 0,
  };
  schemaDetails: Scheme = {
    id: 0,
    name: '',
    description: '',
    longDescription: '',
    enterpriseId: 0,
    externalId: '',
    isActive: false,
    parameters: this.schemeParameters,
    schemaType: '',
  };

  //Mockeado
  /*schemaDetail = {
    id: 1,
    schemeName: 'Cuadrado',
    shortDescription: 'Este esquema explica como funciona',
    fullDescription:
      'Este esquema explica como funciona el elemento del esquema que esta planteado con el objetivo',
    isSchemaActive: 'Si',
    schemaStatus: 'Activo' //Activo / Inactivo
  };*/

  getSchemaDetail() {
    //Obtener el detalle del back
    //usar el id this.schemaId
    //GetById
    console.log('Id: ', this.schemaId);
    this.schemeService.getSchemeById(this.schemaId).subscribe({
      next: (response) => {
        this.schemaDetails = response;
        console.log('Detalle Esquema: ', this.schemaDetails);

        this.setFormValues();
      },
    });
  }

  setFormValues() {
    //if (!this.revenueDetailsFormatted) return;

    this.detailedInfoForm.patchValue({
      //transaccion
      schemeName: this.schemaDetails.name || '',
      shortDescription: this.schemaDetails.description || '',
      fullDescription: this.schemaDetails.longDescription || '',
      isSchemaActive: this.schemaDetails.isActive || '',
      schemaStatus: this.getStatusText(this.schemaDetails.isActive),
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
    console.log('Id: ', this.schemaId);
    this.schemeService.patchScheme(this.schemaId).subscribe({
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
