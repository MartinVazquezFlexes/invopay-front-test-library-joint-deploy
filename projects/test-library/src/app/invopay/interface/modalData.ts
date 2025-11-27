import { FormControl } from "@angular/forms";

export interface FilterInput {
  label: string;
  control: FormControl;
  type: 'select' | 'date' | 'text' | 'number';
  options?: { value: any; label: string }[]; // Para selects
  placeholder?: string;
}

export interface FilterModalData {
  title: string;
  inputs: FilterInput[];
  showSearch?: boolean;
  showClean?: boolean;
}