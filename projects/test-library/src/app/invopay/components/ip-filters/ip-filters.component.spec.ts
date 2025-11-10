import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpFiltersComponent } from './ip-filters.component';

describe('IpFiltersComponent', () => {
  let component: IpFiltersComponent;
  let fixture: ComponentFixture<IpFiltersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IpFiltersComponent]
    });
    fixture = TestBed.createComponent(IpFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
