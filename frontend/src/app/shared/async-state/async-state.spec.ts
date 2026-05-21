import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsyncStateComponent } from './async-state';

describe('AsyncStateComponent', () => {
  let component: AsyncStateComponent;
  let fixture: ComponentFixture<AsyncStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsyncStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AsyncStateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
