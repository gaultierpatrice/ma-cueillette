import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Picking, Review } from './picking.types';

@Injectable({
  providedIn: 'root'
})
export class PickingService {
  private apiUrl = 'http://localhost:8080/api/pickings';
  private favoritesUrl = 'http://localhost:8080/api/favorites';

  constructor(private http: HttpClient) {}

  getAllPickings(): Observable<Picking[]> {
    return this.http.get<Picking[]>(this.apiUrl);
  }

  getPickingById(id: string | number): Observable<Picking> {
    return this.http.get<Picking>(`${this.apiUrl}/${id}`);
  }

  getPickingReviews(id: string | number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/${id}/reviews`);
  }

  addReview(pickingId: string | number, rating: number, comment: string, token: string): Observable<Review> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    const body = { rating, comment };
    return this.http.post<Review>(`${this.apiUrl}/${pickingId}/reviews`, body, { headers });
  }

  addToFavorites(pickingId: string | number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(`${this.favoritesUrl}/${pickingId}`, {}, { headers });
  }

  removeFromFavorites(pickingId: string | number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete(`${this.favoritesUrl}/${pickingId}`, { headers });
  }

  getUserFavorites(token: string): Observable<Picking[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Picking[]>(this.favoritesUrl, { headers });
  }

  checkFavorite(pickingId: string | number, token: string): Observable<{ isFavorite: boolean }> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<{ isFavorite: boolean }>(`${this.favoritesUrl}/check/${pickingId}`, { headers });
  }
}
