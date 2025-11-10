import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpHeaderV2Component } from './ip-header-v2.component';

describe('IpHeaderV2Component', () => {
  let component: IpHeaderV2Component;
  let fixture: ComponentFixture<IpHeaderV2Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IpHeaderV2Component]
    });
    fixture = TestBed.createComponent(IpHeaderV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
