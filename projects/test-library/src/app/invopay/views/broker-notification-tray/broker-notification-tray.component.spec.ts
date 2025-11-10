import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrokerNotificationTrayComponent } from './broker-notification-tray.component';

describe('BrokerNotificationTrayComponent', () => {
  let component: BrokerNotificationTrayComponent;
  let fixture: ComponentFixture<BrokerNotificationTrayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BrokerNotificationTrayComponent]
    });
    fixture = TestBed.createComponent(BrokerNotificationTrayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
