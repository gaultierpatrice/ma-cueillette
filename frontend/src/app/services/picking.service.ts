import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { Picking, Review } from './picking.types';
import { getApiRoot } from './api-config';

@Injectable({
  providedIn: 'root',
})
export class PickingService {
  private readonly apiBase = getApiRoot();
  private readonly pickingsUrl = `${this.apiBase}/pickings`;
  private readonly favoritesUrl = `${this.apiBase}/favorites`;

  constructor(private http: HttpClient) {}

  getAllPickings(): Observable<Picking[]> {
    return this.http.get<Picking[]>(this.pickingsUrl);
  }

  getPickingById(id: string | number): Observable<Picking> {
    return this.http.get<Picking>(`${this.pickingsUrl}/${id}`);
  }

  getPickingReviews(id: string | number): Observable<Review[]> {
    const params = new HttpParams().set('_', String(Date.now()));
    return this.http.get<Review[]>(`${this.pickingsUrl}/${id}/reviews`, { params });
  }

  addReview(pickingId: string | number, rating: number, comment: string): Observable<Review> {
    return this.http.post<Review>(`${this.pickingsUrl}/${pickingId}/reviews`, { rating, comment });
  }

  updateReview(
    pickingId: string | number,
    reviewId: number,
    rating: number,
    comment: string,
  ): Observable<Review> {
    return this.http.put<Review>(`${this.pickingsUrl}/${pickingId}/reviews/${reviewId}`, {
      rating,
      comment,
    });
  }

  deleteReview(pickingId: string | number, reviewId: number): Observable<void> {
    return this.http
      .delete(`${this.pickingsUrl}/${pickingId}/reviews/${reviewId}`, { responseType: 'text' })
      .pipe(map(() => undefined));
  }

  addToFavorites(pickingId: string | number): Observable<{ message: string; favoriteId: string }> {
    return this.http.post<{ message: string; favoriteId: string }>(`${this.favoritesUrl}/${pickingId}`, {});
  }

  removeFromFavorites(pickingId: string | number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.favoritesUrl}/${pickingId}`);
  }

  getUserFavorites(): Observable<Picking[]> {
    return this.http.get<Picking[]>(this.favoritesUrl);
  }

  checkFavorite(pickingId: string | number): Observable<{ isFavorite: boolean }> {
    return this.http.get<{ isFavorite: boolean }>(`${this.favoritesUrl}/check/${pickingId}`);
  }

  getMyPicking(): Observable<Picking | null> {
    return this.http.get<Picking>(`${this.pickingsUrl}/mine`).pipe(
      catchError((error) => (error.status === 404 ? of(null) : throwError(() => error))),
    );
  }

  createPicking(pickingData: unknown): Observable<Picking> {
    return this.http.post<Picking>(this.pickingsUrl, pickingData);
  }

  updatePicking(id: number, pickingData: unknown): Observable<Picking> {
    return this.http.put<Picking>(`${this.pickingsUrl}/${id}`, pickingData);
  }

  uploadPickingImage(id: number, file: File): Observable<Picking> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Picking>(`${this.pickingsUrl}/${id}/image`, formData);
  }

  deletePicking(pickingId: string | number): Observable<void> {
    return this.http.delete<void>(`${this.pickingsUrl}/${pickingId}`);
  }
}
