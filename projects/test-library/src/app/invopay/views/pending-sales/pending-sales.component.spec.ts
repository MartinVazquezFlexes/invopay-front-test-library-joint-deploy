import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingSalesComponent } from './pending-sales.component';

describe('PendingSalesComponent', () => {
  let component: PendingSalesComponent;
  let fixture: ComponentFixture<PendingSalesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PendingSalesComponent]
    });
    fixture = TestBed.createComponent(PendingSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
