import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationTrayComponent } from './notification-tray.component';

describe('NotificationTrayComponent', () => {
  let component: NotificationTrayComponent;
  let fixture: ComponentFixture<NotificationTrayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationTrayComponent]
    });
    fixture = TestBed.createComponent(NotificationTrayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
