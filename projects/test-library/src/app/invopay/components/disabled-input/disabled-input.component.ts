import { Component, Input, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SharedModule } from "../../../shared/shared.module";

@Component({
  selector: 'app-disabled-input',
  templateUrl: './disabled-input.component.html',
  styleUrls: ['./disabled-input.component.scss'],
})
export class DisabledInputComponent {

  @Input() label: string = '';
  @Input() value: string | number | undefined| null = null;
  @Input() inputId: string = '';

  control!: FormControl;

  ngOnInit(): void {
    this.control = new FormControl({ value: this.value, disabled: true });
  }
    ngOnChanges(changes: SimpleChanges) {
    if (changes['value'] && !changes['value'].firstChange) {
      this.control.setValue(this.value);
    }
  }
}
