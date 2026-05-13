import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    return this.http.get<Review[]>(`${this.pickingsUrl}/${id}/reviews`);
  }

  addReview(pickingId: string | number, rating: number, comment: string): Observable<Review> {
    return this.http.post<Review>(`${this.pickingsUrl}/${pickingId}/reviews`, { rating, comment });
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

  createPicking(pickingData: unknown): Observable<Picking> {
    return this.http.post<Picking>(this.pickingsUrl, pickingData);
  }

  deletePicking(pickingId: string | number): Observable<void> {
    return this.http.delete<void>(`${this.pickingsUrl}/${pickingId}`);
  }
}
