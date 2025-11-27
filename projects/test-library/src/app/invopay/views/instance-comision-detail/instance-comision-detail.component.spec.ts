import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstanceComisionDetailComponent } from './instance-comision-detail.component';

describe('InstanceComisionDetailComponent', () => {
  let component: InstanceComisionDetailComponent;
  let fixture: ComponentFixture<InstanceComisionDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InstanceComisionDetailComponent]
    });
    fixture = TestBed.createComponent(InstanceComisionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
