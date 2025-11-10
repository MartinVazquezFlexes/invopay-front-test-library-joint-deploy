import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';
import IpSelectInputOption from '../../interfaces/ip-select-input-option';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-ip-select-input',
  templateUrl: './ip-select-input.component.html',
  styleUrls: ['./ip-select-input.component.scss'],
})
export class IpSelectInputComponent {
  @Input() control = new FormControl();
  @Input() label = '';
  @Input() onStyle = '';
  @Output() selectEmitter = new EventEmitter<any>();
  @Input() labelCode = '';
  @Input() options: IpSelectInputOption[] = [];
  @Input() selectFirstOption = false;
  @Input() isMultiple = false;
  @Input() disabled = false;
  @Input() reset = false;
  @Input() withSearch = false;
  @Input() placeholder = '';
  @Input() formGroup: FormGroup | null = null;
  @Input() controlName: string | null = null;
  @Input() noneOption = false;

  selectedAllOptions = false;
  errorMessages: Record<string, string> = {
    required: 'IP.VALIDATORS.REQUIRED',
  };

  filteredOptions: ReplaySubject<IpSelectInputOption[]> = new ReplaySubject<IpSelectInputOption[]>(1);

  searchCtrl: FormControl = new FormControl('');
  private _onDestroy = new Subject<void>();
  private translateService: TranslateService = inject(TranslateService);

  ngOnInit(): void {
    if (this.formGroup && this.controlName) {
      this.control = this.formGroup.get(this.controlName) as FormControl;
    }
    if (this.selectFirstOption && this.options.length > 0) {
      const firstOptionValue = this.options[0].value;
      this.onSelectMaterial({
        value: this.isMultiple ? [firstOptionValue] : firstOptionValue,
      });
    }
    if (this.disabled) {
      this.control.disable();
    }
    this.filteredOptions.next(this.options.slice());
    this.searchCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(this.filterOptions.bind(this));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reset'] && changes['reset'].currentValue) {
      this.control.reset();
      this.selectedAllOptions = false;
      if (this.disabled) {
        this.control.disable();
      }
      if (this.selectFirstOption && this.options.length > 0) {
        const firstOptionValue = this.options[0].value;
        this.onSelectMaterial({
          value: this.isMultiple ? [firstOptionValue] : firstOptionValue,
        });
      }
    }
    if (changes['options'] && !changes['options'].firstChange) {
      this.filteredOptions.next(this.options.slice());
      if (this.selectFirstOption && this.options.length > 0) {
        const firstOptionValue = this.options[0].value;
        this.onSelectMaterial({
          value: this.isMultiple ? [firstOptionValue] : firstOptionValue,
        });
      }
    }
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  getErrorMessage(): string {
    if (this.control.touched && this.control.invalid && this.control.errors) {
      const errorKey = Object.keys(this.control.errors || {})[0];
      return this.errorMessages[errorKey] || '';
    }
    return '';
  }

  onSelect(ev: any) {
    this.selectEmitter.emit(ev.target.value);
  }

  onSelectMaterial(ev: { value: any }) {
    let selectedOptions = ev.value;
    if (this.isMultiple && Array.isArray(selectedOptions)) {
      selectedOptions = this.getSelectedOptionsForMultiple(selectedOptions);
      this.control.setValue(selectedOptions);
    }
    this.emitSelectedOptions(selectedOptions);
  }

  private getSelectedOptionsForMultiple(
    selectedOptionValues: string[]
  ): string[] {
    let selectedValues = selectedOptionValues;
    if (selectedOptionValues.includes('all') && !this.selectedAllOptions) {
      this.selectedAllOptions = true;
      selectedValues = this.options.map((option) => option.value);
    }
    if (!selectedOptionValues.includes('all') && this.selectedAllOptions) {
      this.selectedAllOptions = false;
      selectedValues = [];
    }
    return selectedValues;
  }

  private emitSelectedOptions(selectedOptions: string | string[]) {
    if (this.isMultiple && Array.isArray(selectedOptions)) {
      this.selectEmitter.emit(
        selectedOptions.filter((option) => option !== 'all')
      );
      return;
    }
    this.selectEmitter.emit(selectedOptions);
  }

  private filterOptions(searchTerm: string) {
    if (!searchTerm) {
      this.filteredOptions.next(this.options.slice());
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = this.options.filter((option) => {
      // Buscar tanto en label como en labelCode si existe
      const labelMatch = option.label.toLowerCase().includes(lowerSearchTerm);
      const labelCodeMatch = option.labelCode ? this.translateService.instant(option.labelCode).toLowerCase().includes(lowerSearchTerm) : false;
      return labelMatch || labelCodeMatch;
    });

    this.filteredOptions.next(filtered);

  }
}
