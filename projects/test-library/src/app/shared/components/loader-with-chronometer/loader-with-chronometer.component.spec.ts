import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoaderWithChronometerComponent } from './loader-with-chronometer.component';

describe('LoaderWithChronometerComponent', () => {
  let component: LoaderWithChronometerComponent;
  let fixture: ComponentFixture<LoaderWithChronometerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoaderWithChronometerComponent]
    });
    fixture = TestBed.createComponent(LoaderWithChronometerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
