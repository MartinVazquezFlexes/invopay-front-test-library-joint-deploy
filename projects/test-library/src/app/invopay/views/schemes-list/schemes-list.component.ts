import { Component, inject, OnInit } from '@angular/core';
import IpSelectInputOption from 'dist/base/lib/interfaces/ip-select-input-option';
import { FormControl } from '@angular/forms';
import { SchemeService } from '../../services/scheme.service';
import { Scheme } from '../../interface/scheme';
import { SchemaContext } from '../../components/modal-schema/modal-schema.component';


@Component({
  selector: 'app-schemes-list',
  templateUrl: './schemes-list.component.html',
  styleUrls: ['./schemes-list.component.scss'],
})
export class SchemesListComponent implements OnInit {
  constructor() {}

  private readonly schemeService = inject(SchemeService);

  ngOnInit() {
    this.getSchemas();
  }

  optPages: boolean = false;
  //Encabezados
  propertyOrder = ['schemeName', 'description', 'isSchemaActive'];
  //Por si queres traducir el encabezado
  keyTranslate = 'IP.ADMIN_TABLE';
  //Acciones de la tabla
  actions: string[] = ['detail', 'status'];
  //Acciones de condicion
  actionsIf: any[] = [];
  //Inicializar la tabla
  initTable = false;
  //Si queremos scroll o no
  scroll = true;

  //Cuando se pulsa el boton de detalle le paso el
  // dataField que tiene la informacion del objeto
  onAction(event: any) {
    console.log('Acción recibida:', event);
    this.openModal(event.dataField.id, event.event);
  }

  //Si seleccionamos items
  onSelectedItemsChange(items: any[]) {
    console.log('Items seleccionados:', items);
  }

  tableData: Scheme[] = [];
  getSchemas() {

    //GetAll
    this.schemeService.getSchemes().subscribe({
        next: (response) => {
          this.tableData = response.content;
          console.log('Esquemas: ', this.tableData);
          console.log('Endpoint: ', response);
  
            this.tableData = response.content.map((scheme: Scheme) => ({
            ...scheme,
            schemeName: scheme.name,
            isSchemaActive: scheme.isActive ? 'Si' : 'No',
  
          })) as any;
  
          this.currentPage = 1; //cargo la pagina 1
          this.updatePage(); //actualizo los items de la pagina 1
        },
      });
  }

  showModal = false;
  schemaId: number = 0;
  context: SchemaContext = 'detail';
  openModal(id: number, type: string) {
    this.schemaId = id;
    if (type == 'detail') {
      this.context = type;
    } else if (type == 'status') {
      this.context = type;
    } else {
      console.log('type not exists');
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  updateTable(){
    this.getSchemas();
    this.showModal = false;
  }

  // Mobile
  openMenuId: number | null = null;

  toggleMenu(id: number) {
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  //Paginador
  /*
            Aca irian los datos de cantidad de items en tiempo real
            totalItems = total con filtros y sin
            items por pagina cambiar segun seleccion
            current pages seria tableData.lenght / itemsPerPage y rounded para arriba
    */
  pagedData: any[] = [];
  currentPage = 1;
  itemsPerPage = 15;


  onPageChange(page: number) {
    this.currentPage = page;
    this.updatePage();
  }

  updatePage() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    this.pagedData = this.tableData.slice(startIndex, endIndex);
  }

  itemsPerPageControl = new FormControl('15');
  pageOptions: IpSelectInputOption[] = [
    { value: '10', label: '10' },
    { value: '15', label: '15' },
    { value: '20', label: '20' },
    { value: '25', label: '25' },
  ];
  onItemsPerPageChange(newValue: any) {
    console.log(newValue);
    this.itemsPerPage = Number(newValue);
    this.itemsPerPageControl.setValue(newValue); //sincroniza el control
    this.currentPage = 1;
    this.updatePage();
  }
}
