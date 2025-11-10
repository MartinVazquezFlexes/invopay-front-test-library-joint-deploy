import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpFormModalComponent } from './ip-form-modal.component';

describe('IpFormModalComponent', () => {
  let component: IpFormModalComponent;
  let fixture: ComponentFixture<IpFormModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IpFormModalComponent]
    });
    fixture = TestBed.createComponent(IpFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
