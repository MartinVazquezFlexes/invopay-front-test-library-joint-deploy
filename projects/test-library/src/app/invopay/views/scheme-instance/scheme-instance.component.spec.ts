import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeInstanceComponent } from './scheme-instance.component';

describe('SchemeInstanceComponent', () => {
  let component: SchemeInstanceComponent;
  let fixture: ComponentFixture<SchemeInstanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchemeInstanceComponent]
    });
    fixture = TestBed.createComponent(SchemeInstanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
