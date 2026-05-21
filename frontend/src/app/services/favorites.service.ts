import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from './auth';
import { PickingService } from './picking.service';
import { Picking } from './picking.types';
import { getApiErrorMessage } from '../utils/api-error';
import {
  FavoriteActionResult,
  FAVORITE_ADD_ERROR_MESSAGE,
  FAVORITE_LOAD_ERROR_MESSAGE,
  FAVORITE_REMOVE_ERROR_MESSAGE,
} from './favorites.types';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly favoriteIds = signal<ReadonlySet<number>>(new Set());

  constructor(
    private pickingService: PickingService,
    private authService: AuthService,
  ) {}

  isFavorite(pickingId: number): boolean {
    return this.favoriteIds().has(pickingId);
  }

  loadUserFavorites(): Observable<Picking[]> {
    if (!this.authService.isLoggedIn()) {
      this.favoriteIds.set(new Set());
      return of([]);
    }

    return this.pickingService.getUserFavorites().pipe(
      tap((favorites) => {
        this.favoriteIds.set(new Set(favorites.map((picking) => picking.id)));
      }),
      catchError(() => {
        this.favoriteIds.set(new Set());
        return of([]);
      }),
    );
  }

  loadUserFavoritesWithError(): Observable<{ favorites: Picking[]; error: string | null }> {
    if (!this.authService.isLoggedIn()) {
      this.favoriteIds.set(new Set());
      return of({ favorites: [], error: null });
    }

    return this.pickingService.getUserFavorites().pipe(
      map((favorites) => {
        this.favoriteIds.set(new Set(favorites.map((picking) => picking.id)));
        return { favorites, error: null };
      }),
      catchError((err) => {
        this.favoriteIds.set(new Set());
        return of({
          favorites: [],
          error: getApiErrorMessage(err, FAVORITE_LOAD_ERROR_MESSAGE),
        });
      }),
    );
  }

  toggleFavorite(pickingId: number): Observable<FavoriteActionResult> {
    if (!this.authService.isLoggedIn()) {
      return of({ status: 'login_required' });
    }

    if (this.favoriteIds().has(pickingId)) {
      return this.pickingService.removeFromFavorites(pickingId).pipe(
        map(() => {
          this.removeFromLocalState(pickingId);
          return { status: 'toggled', isFavorite: false } as const;
        }),
        catchError((err) =>
          of({
            status: 'error',
            message: getApiErrorMessage(err, FAVORITE_REMOVE_ERROR_MESSAGE),
          } as const),
        ),
      );
    }

    return this.pickingService.addToFavorites(pickingId).pipe(
      map(() => {
        this.addToLocalState(pickingId);
        return { status: 'toggled', isFavorite: true } as const;
      }),
      catchError((err) =>
        of({
          status: 'error',
          message: getApiErrorMessage(err, FAVORITE_ADD_ERROR_MESSAGE),
        } as const),
      ),
    );
  }

  removeFavorite(pickingId: number): Observable<FavoriteActionResult> {
    if (!this.authService.isLoggedIn()) {
      return of({ status: 'login_required' });
    }

    return this.pickingService.removeFromFavorites(pickingId).pipe(
      map(() => {
        this.removeFromLocalState(pickingId);
        return { status: 'removed' } as const;
      }),
      catchError((err) =>
        of({
          status: 'error',
          message: getApiErrorMessage(err, FAVORITE_REMOVE_ERROR_MESSAGE),
        } as const),
      ),
    );
  }

  private addToLocalState(pickingId: number): void {
    const next = new Set(this.favoriteIds());
    next.add(pickingId);
    this.favoriteIds.set(next);
  }

  private removeFromLocalState(pickingId: number): void {
    const next = new Set(this.favoriteIds());
    next.delete(pickingId);
    this.favoriteIds.set(next);
  }
}
