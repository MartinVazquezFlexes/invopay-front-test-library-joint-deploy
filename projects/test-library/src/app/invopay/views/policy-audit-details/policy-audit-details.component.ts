import { Component, inject, Input, OnInit } from '@angular/core';
import { LoadingService } from '../../../shared/services/loading.service';
import { PolicyService } from '../../services/policy.service';
import { FormControl } from '@angular/forms';
import IpSelectInputOption from '../../interface/ip-select-input-option';
import { CommissionChangeAudit } from '../../interface/policyData';

@Component({
  selector: 'app-policy-audit-details',
  templateUrl: './policy-audit-details.component.html',
  styleUrls: ['./policy-audit-details.component.scss'],
})
export class PolicyAuditDetailsComponent implements OnInit {

  @Input() policyAudits: CommissionChangeAudit[] = [];

  constructor(public loadingService: LoadingService) {}

  private readonly policyService = inject(PolicyService);

  ngOnInit() {
    //metodo para estar atento al cambio de tamaño y setear en 10 la paginacion en mobile
    this.setItemsPerPageByWindowSize();
    window.addEventListener(
      'resize',
      this.setItemsPerPageByWindowSize.bind(this)
    );

    this.getAudits();
  }

  private setItemsPerPageByWindowSize() {
    if (window.innerWidth <= 768) {
      this.itemsPerPage = 10;
      this.itemsPerPageControl.setValue('10');
    } else {
      //Valor por defecto en escritorio
      this.itemsPerPage = 10;
      this.itemsPerPageControl.setValue(this.itemsPerPage.toString());
    }
    this.updatePage();
  }

  optPages: boolean = false;
  //Encabezados
  propertyOrder = [
    'changeDate',
    'changedByUserName',
    'previousPercentage',
    'newPercentage',
  ];
  //Por si queres traducir el encabezado
  keyTranslate = 'IP.POLICY_DETAILS.AUDIT';
  //Acciones de la tabla
  actions: string[] = [];
  //Acciones de condicion
  actionsIf: any[] = [];
  //Inicializar la tabla
  initTable = false;
  //Si queremos scroll o no
  scroll = true;
  columnWidths = {
    changeDate: '100px',
    changedByUserName: '200px',
    previousPercentage: '120px',
    newPercentage: '120px',
  };

  //Cuando se pulsa el boton de detalle le paso el
  // dataField que tiene la informacion del objeto
  onAction(event: any) {
    console.log('Acción recibida:', event);
  }

  //Si seleccionamos items
  onSelectedItemsChange(items: any[]) {
    console.log('Items seleccionados:', items);
  }

  tableData: any[] = [
    {
      id:1,
      changeDate: '2025-11-28 09:15:00',
      changedByUserName: 'María González',
      previousPercentage: "8%",
      newPercentage: "10%",
    },
    {
      id:2,
      changeDate: '2025-11-15 14:30:00',
      changedByUserName: 'Carlos Rodríguez',
      previousPercentage: "15%",
      newPercentage: "10%",
    },
    {
      id:3,
      changeDate: '2025-10-22 11:45:00',
      changedByUserName: 'Ana Martínez',
      previousPercentage: "12%",
      newPercentage: "10%",
    },
    {
      id:4,
      changeDate: '2025-10-05 16:20:00',
      changedByUserName: 'Roberto Fernández',
      previousPercentage: "13%",
      newPercentage: "10%",
    },
    {
      id:5,
      changeDate: '2025-09-18 10:00:00',
      changedByUserName: 'Laura Sánchez',
      previousPercentage: "5%",
      newPercentage: "10%",
    },
    {
      id:6,
      changeDate: '2025-08-30 13:15:00',
      changedByUserName: 'Diego López',
      previousPercentage: "15%",
      newPercentage: "10%",
    },
    {
      id:7,
      changeDate: '2025-08-12 08:45:00',
      changedByUserName: 'Sofía Ramírez',
      previousPercentage: "12%",
      newPercentage: "10%",
    },
    {
      id:8,
      changeDate: '2025-07-25 15:30:00',
      changedByUserName: 'Javier Torres',
      previousPercentage: "7%",
      newPercentage: "10%",
    },
    {
      id:9,
      changeDate: '2025-07-08 12:00:00',
      changedByUserName: 'Patricia Díaz',
      previousPercentage: "6%",
      newPercentage: "10%",
    },
    {
      id:10,
      changeDate: '2025-06-20 09:30:00',
      changedByUserName: 'Fernando Castro',
      previousPercentage: "3%",
      newPercentage: "10%",
    },
    {
      id:11,
      changeDate: '2025-06-03 14:15:00',
      changedByUserName: 'Valentina Ruiz',
      previousPercentage: "20%",
      newPercentage: "10%",
    },
    {
      id:12,
      changeDate: '2025-05-16 11:00:00',
      changedByUserName: 'Martín Herrera',
      previousPercentage: "9%",
      newPercentage: "10%",
    },
    {
      id:13,
      changeDate: '2025-04-28 16:45:00',
      changedByUserName: 'Camila Morales',
      previousPercentage: "6%",
      newPercentage: "10%",
    },
    {
      id:14,
      changeDate: '2025-04-10 10:30:00',
      changedByUserName: 'Andrés Gutiérrez',
      previousPercentage: "12%",
      newPercentage: "10%",
    },
    {
      id:15,
      changeDate: '2025-03-22 13:45:00',
      changedByUserName: 'Lucía Vega',
      previousPercentage: "4%",
      newPercentage: "10%",
    },
  ];

  //DESCOMENTAR SI CARGAN DATOS
  //tableData : CommissionChangeAudit[] = []; 
  //DESCOMENTAR SI CARGAN DATOS

  getAudits() {

    console.log("Audits: ", this.policyAudits);
    //mapear audits cuando vengan del back

    //DESCOMENTAR SI CARGAN DATOS
    /*this.tableData = this.policyAudits.map((policy: CommissionChangeAudit) => ({
              ...policy,
              newPercentage: policy.newPercentage + "%",
              previousPercentage: policy.previousPercentage + "%",
            })) as any;*/
    //DESCOMENTAR SI CARGAN DATOS

    this.sortAuditsByDate();
    this.currentPage = 1;
    this.updatePage();
  }

  private sortAuditsByDate() {
  this.tableData.sort((a, b) => {
    const dateA = new Date(a.changeDate).getTime();
    const dateB = new Date(b.changeDate).getTime();
    //descendente: más nuevo primero(dateB - dateA)
    return dateB - dateA;
  });
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
  itemsPerPage = 10;

  onPageChange(page: number) {
    this.currentPage = page;
    this.updatePage();
  }

  updatePage() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    this.pagedData = this.tableData.slice(startIndex, endIndex);
  }

  itemsPerPageControl = new FormControl('10');
  pageOptions: IpSelectInputOption[] = [
    { value: '10', label: '10' },
    { value: '15', label: '15' },
    { value: '20', label: '20' },
    { value: '25', label: '25' },
  ];
  onItemsPerPageChange(newValue: any) {
    this.itemsPerPage = Number(newValue);
    this.itemsPerPageControl.setValue(newValue); //sincroniza el control
    this.currentPage = 1;
    this.updatePage();
  }
}
