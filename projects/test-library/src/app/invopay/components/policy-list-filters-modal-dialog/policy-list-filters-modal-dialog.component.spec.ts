import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyListFiltersModalDialogComponent } from './policy-list-filters-modal-dialog.component';

describe('PolicyListFiltersModalDialogComponent', () => {
  let component: PolicyListFiltersModalDialogComponent;
  let fixture: ComponentFixture<PolicyListFiltersModalDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PolicyListFiltersModalDialogComponent]
    });
    fixture = TestBed.createComponent(PolicyListFiltersModalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
