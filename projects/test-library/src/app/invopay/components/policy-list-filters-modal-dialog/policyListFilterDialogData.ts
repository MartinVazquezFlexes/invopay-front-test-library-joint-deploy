import { FormControl, FormGroup } from "@angular/forms";
import IpSelectInputOption from "../../interface/ip-select-input-option";

export interface FiltersDialogData {
 controlsForm: FormGroup<{
    productFilter: FormControl<string | null>;
    clientFilter: FormControl<string | null>;
    brokerFilter: FormControl<string | null>;
    dateStart: FormControl<string | null>;
    dateEnd: FormControl<string | null>;
    rowPaginator: FormControl<number | null>;
  }>;  products: IpSelectInputOption[];
  clients: IpSelectInputOption[];
  brokers: IpSelectInputOption[];
  userType: 'broker' | 'assurance';
  maxStart: string;
  maxEnd: string;
  minEnd: string;
}