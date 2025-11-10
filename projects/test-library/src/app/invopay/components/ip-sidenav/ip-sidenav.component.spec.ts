import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpSidenavComponent } from './ip-sidenav.component';

describe('IpSidenavComponent', () => {
  let component: IpSidenavComponent;
  let fixture: ComponentFixture<IpSidenavComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IpSidenavComponent]
    });
    fixture = TestBed.createComponent(IpSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
