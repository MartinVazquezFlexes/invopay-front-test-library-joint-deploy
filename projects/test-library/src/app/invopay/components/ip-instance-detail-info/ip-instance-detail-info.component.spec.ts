import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpInstanceDetailInfoComponent } from './ip-instance-detail-info.component';

describe('IpInstanceDetailInfoComponent', () => {
  let component: IpInstanceDetailInfoComponent;
  let fixture: ComponentFixture<IpInstanceDetailInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IpInstanceDetailInfoComponent]
    });
    fixture = TestBed.createComponent(IpInstanceDetailInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
