import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpButtonModalComponent } from './ip-button-modal.component';

describe('IpButtonModalComponent', () => {
  let component: IpButtonModalComponent;
  let fixture: ComponentFixture<IpButtonModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IpButtonModalComponent]
    });
    fixture = TestBed.createComponent(IpButtonModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
