import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpSuccessSnackBarComponent } from './ip-success-snack-bar.component';

describe('IpSuccessSnackBarComponent', () => {
  let component: IpSuccessSnackBarComponent;
  let fixture: ComponentFixture<IpSuccessSnackBarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IpSuccessSnackBarComponent]
    });
    fixture = TestBed.createComponent(IpSuccessSnackBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
