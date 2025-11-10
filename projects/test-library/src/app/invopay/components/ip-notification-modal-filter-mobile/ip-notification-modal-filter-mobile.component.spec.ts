import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpNotificationModalFilterMobileComponent } from './ip-notification-modal-filter-mobile.component';

describe('IpNotificationModalFilterMobileComponent', () => {
  let component: IpNotificationModalFilterMobileComponent;
  let fixture: ComponentFixture<IpNotificationModalFilterMobileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IpNotificationModalFilterMobileComponent]
    });
    fixture = TestBed.createComponent(IpNotificationModalFilterMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
