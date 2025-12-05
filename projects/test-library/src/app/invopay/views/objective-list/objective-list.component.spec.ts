import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectiveListComponent } from './objective-list.component';

describe('ObjectiveListComponent', () => {
  let component: ObjectiveListComponent;
  let fixture: ComponentFixture<ObjectiveListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ObjectiveListComponent]
    });
    fixture = TestBed.createComponent(ObjectiveListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
