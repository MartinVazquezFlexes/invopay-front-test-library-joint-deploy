import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackNavigateButtonComponent } from './back-navigate-button.component';

describe('BackNavigateButtonComponent', () => {
  let component: BackNavigateButtonComponent;
  let fixture: ComponentFixture<BackNavigateButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BackNavigateButtonComponent]
    });
    fixture = TestBed.createComponent(BackNavigateButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
