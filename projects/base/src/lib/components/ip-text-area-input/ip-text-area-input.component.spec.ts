import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpTextAreaInputComponent } from './ip-text-area-input.component';

describe('IpTextAreaInputComponent', () => {
  let component: IpTextAreaInputComponent;
  let fixture: ComponentFixture<IpTextAreaInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IpTextAreaInputComponent]
    });
    fixture = TestBed.createComponent(IpTextAreaInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
