import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpErrorSnackBarComponent } from './ip-error-snack-bar.component';

describe('IpErrorSnackBarComponent', () => {
  let component: IpErrorSnackBarComponent;
  let fixture: ComponentFixture<IpErrorSnackBarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IpErrorSnackBarComponent]
    });
    fixture = TestBed.createComponent(IpErrorSnackBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
