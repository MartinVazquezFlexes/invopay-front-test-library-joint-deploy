import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyEditModalDialogComponent } from './policy-edit-modal-dialog.component';

describe('PolicyEditModalDialogComponent', () => {
  let component: PolicyEditModalDialogComponent;
  let fixture: ComponentFixture<PolicyEditModalDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PolicyEditModalDialogComponent]
    });
    fixture = TestBed.createComponent(PolicyEditModalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
