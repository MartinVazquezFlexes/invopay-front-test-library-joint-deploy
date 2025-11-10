import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpDragScrollComponent } from './ip-drag-scroll.component';

describe('IpDragScrollComponent', () => {
  let component: IpDragScrollComponent;
  let fixture: ComponentFixture<IpDragScrollComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IpDragScrollComponent]
    });
    fixture = TestBed.createComponent(IpDragScrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
