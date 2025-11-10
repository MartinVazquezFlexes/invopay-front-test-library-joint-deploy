import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpSearchInputComponent } from './ip-search-input.component';

describe('IpSearchInputComponent', () => {
  let component: IpSearchInputComponent;
  let fixture: ComponentFixture<IpSearchInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IpSearchInputComponent]
    });
    fixture = TestBed.createComponent(IpSearchInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
