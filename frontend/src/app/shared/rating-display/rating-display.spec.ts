import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingDisplayComponent } from './rating-display';

describe('RatingDisplayComponent', () => {
  let component: RatingDisplayComponent;
  let fixture: ComponentFixture<RatingDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingDisplayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RatingDisplayComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hide when there are no reviews', () => {
    component.rating = 4.5;
    component.reviewCount = 0;
    expect(component.shouldDisplay).toBeFalse();
  });

  it('should show when rating and reviews are available', () => {
    component.rating = 4.5;
    component.reviewCount = 3;
    expect(component.shouldDisplay).toBeTrue();
  });
});
