import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsuranceNotificationTrayComponent } from './insurance-notification-tray.component';

describe('InsuranceNotificationTrayComponent', () => {
  let component: InsuranceNotificationTrayComponent;
  let fixture: ComponentFixture<InsuranceNotificationTrayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InsuranceNotificationTrayComponent]
    });
    fixture = TestBed.createComponent(InsuranceNotificationTrayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
