import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpDateInputComponent } from './ip-date-input.component';

describe('IpDateInputComponent', () => {
  let component: IpDateInputComponent;
  let fixture: ComponentFixture<IpDateInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IpDateInputComponent]
    });
    fixture = TestBed.createComponent(IpDateInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
