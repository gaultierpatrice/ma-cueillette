import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickingActionsComponent } from './picking-actions';

describe('PickingActionsComponent', () => {
  let component: PickingActionsComponent;
  let fixture: ComponentFixture<PickingActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PickingActionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PickingActionsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
