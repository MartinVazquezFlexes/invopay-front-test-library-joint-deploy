import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpTitleMobileComponent } from './ip-title-mobile.component';

describe('IpTitleMobileComponent', () => {
  let component: IpTitleMobileComponent;
  let fixture: ComponentFixture<IpTitleMobileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IpTitleMobileComponent]
    });
    fixture = TestBed.createComponent(IpTitleMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
