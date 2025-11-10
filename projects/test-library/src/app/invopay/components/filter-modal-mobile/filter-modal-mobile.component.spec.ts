import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterModalMobileComponent } from './filter-modal-mobile.component';

describe('FilterModalMobileComponent', () => {
  let component: FilterModalMobileComponent;
  let fixture: ComponentFixture<FilterModalMobileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FilterModalMobileComponent]
    });
    fixture = TestBed.createComponent(FilterModalMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
