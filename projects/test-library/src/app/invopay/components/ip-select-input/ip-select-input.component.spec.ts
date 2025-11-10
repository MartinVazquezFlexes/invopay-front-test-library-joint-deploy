import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpSelectInputComponent } from './ip-select-input.component';

describe('IpSelectInputComponent', () => {
  let component: IpSelectInputComponent;
  let fixture: ComponentFixture<IpSelectInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IpSelectInputComponent]
    });
    fixture = TestBed.createComponent(IpSelectInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
