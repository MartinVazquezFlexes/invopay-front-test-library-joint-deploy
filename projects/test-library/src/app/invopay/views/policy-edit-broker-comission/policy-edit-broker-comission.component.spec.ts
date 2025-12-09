import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyEditBrokerComissionComponent } from './policy-edit-broker-comission.component';

describe('PolicyEditBrokerComissionComponent', () => {
  let component: PolicyEditBrokerComissionComponent;
  let fixture: ComponentFixture<PolicyEditBrokerComissionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PolicyEditBrokerComissionComponent]
    });
    fixture = TestBed.createComponent(PolicyEditBrokerComissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
