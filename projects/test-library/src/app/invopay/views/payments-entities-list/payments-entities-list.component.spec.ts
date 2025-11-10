import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsEntitiesListComponent } from './payments-entities-list.component';

describe('PaymentsEntitiesListComponent', () => {
  let component: PaymentsEntitiesListComponent;
  let fixture: ComponentFixture<PaymentsEntitiesListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentsEntitiesListComponent]
    });
    fixture = TestBed.createComponent(PaymentsEntitiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
