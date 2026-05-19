import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PickingCardComponent } from './picking-card';

describe('PickingCardComponent', () => {
  let component: PickingCardComponent;
  let fixture: ComponentFixture<PickingCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PickingCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PickingCardComponent);
    component = fixture.componentInstance;
    component.picking = {
      id: 1,
      name: 'Test Picking',
      address: '1 rue Test',
      lat: 0,
      lng: 0,
      city: 'Paris',
      postalCode: '75001',
    };
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
