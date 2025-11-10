import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpModalMobileComponent } from './ip-modal-mobile.component';

describe('IpModalMobileComponent', () => {
  let component: IpModalMobileComponent;
  let fixture: ComponentFixture<IpModalMobileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IpModalMobileComponent]
    });
    fixture = TestBed.createComponent(IpModalMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
