import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';

import { Picking } from './picking.types';
import { PickingService } from './picking.service';

describe('PickingService', () => {
  let service: PickingService;
  let httpMock: HttpTestingController;

  afterEach(() => {
    httpMock.verify();
  });

  function setup(): void {
    TestBed.configureTestingModule({
      providers: [PickingService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PickingService);
    httpMock = TestBed.inject(HttpTestingController);
  }

  it('gets all pickings', () => {
    setup();
    const pickings: Picking[] = [{ id: 1, name: 'Farm', address: '1 rue', lat: 0, lng: 0 }];

    service.getAllPickings().subscribe((result) => {
      expect(result).toEqual(pickings);
    });

    const req = httpMock.expectOne('/api/pickings');
    expect(req.request.method).toBe('GET');
    req.flush(pickings);
  });

  it('gets a picking by id', () => {
    setup();
    const picking: Picking = { id: 2, name: 'Vineyard', address: '2 rue', lat: 1, lng: 2 };

    service.getPickingById(2).subscribe((result) => {
      expect(result).toEqual(picking);
    });

    const req = httpMock.expectOne('/api/pickings/2');
    expect(req.request.method).toBe('GET');
    req.flush(picking);
  });

  it('adds and removes favorites', () => {
    setup();

    service.addToFavorites(5).subscribe((result) => {
      expect(result.favoriteId).toBe('fav-1');
    });

    let req = httpMock.expectOne('/api/favorites/5');
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'added', favoriteId: 'fav-1' });

    service.removeFromFavorites(5).subscribe((result) => {
      expect(result.message).toBe('removed');
    });

    req = httpMock.expectOne('/api/favorites/5');
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'removed' });
  });

  it('loads user favorites', () => {
    setup();
    const favorites: Picking[] = [{ id: 3, name: 'Garden', address: '3 rue', lat: 0, lng: 0 }];

    service.getUserFavorites().subscribe((result) => {
      expect(result).toEqual(favorites);
    });

    const req = httpMock.expectOne('/api/favorites');
    expect(req.request.method).toBe('GET');
    req.flush(favorites);
  });

  it('posts a review for a picking', () => {
    setup();
    const review = {
      id: 1,
      rating: 4,
      comment: 'Great',
      publishedAt: '2026-01-01',
      user: { id: 'u1', name: 'Bob' },
    };

    service.addReview(7, 4, 'Great').subscribe((result) => {
      expect(result).toEqual(review);
    });

    const req = httpMock.expectOne('/api/pickings/7/reviews');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ rating: 4, comment: 'Great' });
    req.flush(review);
  });
});
