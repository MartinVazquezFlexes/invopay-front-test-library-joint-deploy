import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileCardListComponent } from './mobile-card-list.component';

describe('MobileCardListComponent', () => {
  let component: MobileCardListComponent;
  let fixture: ComponentFixture<MobileCardListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MobileCardListComponent]
    });
    fixture = TestBed.createComponent(MobileCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
