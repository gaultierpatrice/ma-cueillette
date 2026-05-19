import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AuthService } from './auth';
import {
  FAVORITE_ADD_ERROR_MESSAGE,
  FAVORITE_LOAD_ERROR_MESSAGE,
  FAVORITE_REMOVE_ERROR_MESSAGE,
} from './favorites.types';
import { FavoritesService } from './favorites.service';
import { PickingService } from './picking.service';
import { Picking } from './picking.types';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let auth: AuthService;
  let httpMock: HttpTestingController;

  const picking: Picking = { id: 42, name: 'Farm', address: '1 rue', lat: 0, lng: 0 };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FavoritesService,
        PickingService,
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    localStorage.clear();
    service = TestBed.inject(FavoritesService);
    auth = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should report unknown pickings as not favorite', () => {
    expect(service.isFavorite(42)).toBe(false);
  });

  it('loadUserFavorites returns empty when not logged in', () => {
    service.loadUserFavorites().subscribe((favorites) => {
      expect(favorites).toEqual([]);
    });
    expect(service.isFavorite(42)).toBe(false);
    httpMock.expectNone('/api/favorites');
  });

  it('loadUserFavorites stores favorite ids when logged in', () => {
    auth.saveToken('token');

    service.loadUserFavorites().subscribe((favorites) => {
      expect(favorites).toEqual([picking]);
    });

    const req = httpMock.expectOne('/api/favorites');
    req.flush([picking]);

    expect(service.isFavorite(42)).toBe(true);
  });

  it('loadUserFavorites clears state on HTTP error', () => {
    auth.saveToken('token');

    service.loadUserFavorites().subscribe((favorites) => {
      expect(favorites).toEqual([]);
    });

    const req = httpMock.expectOne('/api/favorites');
    req.flush({ message: 'fail' }, { status: 500, statusText: 'Server Error' });

    expect(service.isFavorite(42)).toBe(false);
  });

  it('loadUserFavoritesWithError returns favorites when logged in', () => {
    auth.saveToken('token');

    service.loadUserFavoritesWithError().subscribe((result) => {
      expect(result).toEqual({ favorites: [picking], error: null });
    });

    const req = httpMock.expectOne('/api/favorites');
    req.flush([picking]);

    expect(service.isFavorite(42)).toBe(true);
  });

  it('loadUserFavoritesWithError returns empty when not logged in', () => {
    service.loadUserFavoritesWithError().subscribe((result) => {
      expect(result).toEqual({ favorites: [], error: null });
    });
    httpMock.expectNone('/api/favorites');
  });

  it('loadUserFavoritesWithError returns an error message on failure', () => {
    auth.saveToken('token');

    service.loadUserFavoritesWithError().subscribe((result) => {
      expect(result.favorites).toEqual([]);
      expect(result.error).toBe(FAVORITE_LOAD_ERROR_MESSAGE);
    });

    const req = httpMock.expectOne('/api/favorites');
    req.flush({}, { status: 500, statusText: 'Server Error' });
  });

  it('toggleFavorite returns login_required when not logged in', () => {
    service.toggleFavorite(42).subscribe((result) => {
      expect(result).toEqual({ status: 'login_required' });
    });
    httpMock.expectNone('/api/favorites/42');
  });

  it('toggleFavorite adds a favorite via the API', () => {
    auth.saveToken('token');

    service.toggleFavorite(42).subscribe((result) => {
      expect(result).toEqual({ status: 'toggled', isFavorite: true });
    });

    const req = httpMock.expectOne('/api/favorites/42');
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'added', favoriteId: '1' });

    expect(service.isFavorite(42)).toBe(true);
  });

  it('toggleFavorite removes a favorite when already favorited', () => {
    auth.saveToken('token');

    service.loadUserFavorites().subscribe();
    httpMock.expectOne('/api/favorites').flush([picking]);

    service.toggleFavorite(42).subscribe((result) => {
      expect(result).toEqual({ status: 'toggled', isFavorite: false });
    });

    const req = httpMock.expectOne('/api/favorites/42');
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'removed' });

    expect(service.isFavorite(42)).toBe(false);
  });

  it('toggleFavorite returns an error message when add fails', () => {
    auth.saveToken('token');

    service.toggleFavorite(99).subscribe((result) => {
      expect(result).toEqual({
        status: 'error',
        message: FAVORITE_ADD_ERROR_MESSAGE,
      });
    });

    const req = httpMock.expectOne('/api/favorites/99');
    req.flush({}, { status: 409, statusText: 'Conflict' });
  });

  it('toggleFavorite returns an error message when remove fails', () => {
    auth.saveToken('token');

    service.loadUserFavorites().subscribe();
    httpMock.expectOne('/api/favorites').flush([picking]);

    service.toggleFavorite(42).subscribe((result) => {
      expect(result).toEqual({
        status: 'error',
        message: FAVORITE_REMOVE_ERROR_MESSAGE,
      });
    });

    const req = httpMock.expectOne('/api/favorites/42');
    expect(req.request.method).toBe('DELETE');
    req.flush({}, { status: 500, statusText: 'Server Error' });
  });

  it('removeFavorite removes via the API when logged in', () => {
    auth.saveToken('token');

    service.loadUserFavorites().subscribe();
    httpMock.expectOne('/api/favorites').flush([picking]);

    service.removeFavorite(42).subscribe((result) => {
      expect(result).toEqual({ status: 'removed' });
    });

    const req = httpMock.expectOne('/api/favorites/42');
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'removed' });

    expect(service.isFavorite(42)).toBe(false);
  });

  it('removeFavorite returns an error message when delete fails', () => {
    auth.saveToken('token');

    service.removeFavorite(42).subscribe((result) => {
      expect(result).toEqual({
        status: 'error',
        message: FAVORITE_REMOVE_ERROR_MESSAGE,
      });
    });

    const req = httpMock.expectOne('/api/favorites/42');
    req.flush({}, { status: 500, statusText: 'Server Error' });
  });

  it('removeFavorite returns login_required when not logged in', () => {
    service.removeFavorite(42).subscribe((result) => {
      expect(result).toEqual({ status: 'login_required' });
    });
    httpMock.expectNone('/api/favorites/42');
  });
});
