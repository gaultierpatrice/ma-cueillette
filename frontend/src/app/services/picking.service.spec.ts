import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Picking } from './picking.types';
import { PickingService } from './picking.service';

describe('PickingService', () => {
  let service: PickingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PickingService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PickingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('gets all pickings', () => {
    const pickings: Picking[] = [{ id: 1, name: 'Farm', address: '1 rue', lat: 0, lng: 0 }];

    service.getAllPickings().subscribe((result) => {
      expect(result).toEqual(pickings);
    });

    const req = httpMock.expectOne('/api/pickings');
    expect(req.request.method).toBe('GET');
    req.flush(pickings);
  });

  it('gets a picking by id', () => {
    const picking: Picking = { id: 2, name: 'Vineyard', address: '2 rue', lat: 1, lng: 2 };

    service.getPickingById(2).subscribe((result) => {
      expect(result).toEqual(picking);
    });

    const req = httpMock.expectOne('/api/pickings/2');
    expect(req.request.method).toBe('GET');
    req.flush(picking);
  });

  it('gets reviews for a picking', () => {
    const reviews = [
      {
        id: 1,
        rating: 5,
        comment: 'Lovely',
        publishedAt: '2026-01-01',
        user: { id: 'u1', name: 'Alice' },
      },
    ];

    service.getPickingReviews(3).subscribe((result) => {
      expect(result).toEqual(reviews);
    });

    const req = httpMock.expectOne('/api/pickings/3/reviews');
    expect(req.request.method).toBe('GET');
    req.flush(reviews);
  });

  it('posts a review for a picking', () => {
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

  it('adds a favorite for a picking', () => {
    service.addToFavorites(5).subscribe((result) => {
      expect(result).toEqual({ message: 'added', favoriteId: 'fav-1' });
    });

    const req = httpMock.expectOne('/api/favorites/5');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({ message: 'added', favoriteId: 'fav-1' });
  });

  it('removes a favorite for a picking', () => {
    service.removeFromFavorites(5).subscribe((result) => {
      expect(result.message).toBe('removed');
    });

    const req = httpMock.expectOne('/api/favorites/5');
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'removed' });
  });

  it('loads user favorites', () => {
    const favorites: Picking[] = [{ id: 3, name: 'Garden', address: '3 rue', lat: 0, lng: 0 }];

    service.getUserFavorites().subscribe((result) => {
      expect(result).toEqual(favorites);
    });

    const req = httpMock.expectOne('/api/favorites');
    expect(req.request.method).toBe('GET');
    req.flush(favorites);
  });

  it('checks whether a picking is favorited', () => {
    service.checkFavorite(8).subscribe((result) => {
      expect(result.isFavorite).toBe(true);
    });

    const req = httpMock.expectOne('/api/favorites/check/8');
    expect(req.request.method).toBe('GET');
    req.flush({ isFavorite: true });
  });

  it('creates a picking', () => {
    const payload = { name: 'New Farm', address: '5 rue', lat: 1, lng: 2 };
    const created: Picking = { id: 10, name: 'New Farm', address: '5 rue', lat: 1, lng: 2 };

    service.createPicking(payload).subscribe((result) => {
      expect(result).toEqual(created);
    });

    const req = httpMock.expectOne('/api/pickings');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(created);
  });

  it('deletes a picking', () => {
    let completed = false;
    service.deletePicking(12).subscribe({
      next: (result) => {
        expect(result).toBeNull();
        completed = true;
      },
    });

    const req = httpMock.expectOne('/api/pickings/12');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    expect(completed).toBe(true);
  });
});
