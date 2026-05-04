import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Picking, Review } from './picking.types';

@Injectable({
  providedIn: 'root'
})
export class PickingService {
  private apiUrl = 'http://localhost:8080/api/pickings';

  constructor(private http: HttpClient) {}

  getAllPickings(): Observable<Picking[]> {
    return this.http.get<Picking[]>(this.apiUrl);
  }

  getPickingById(id: string): Observable<Picking> {
    return this.http.get<Picking>(`${this.apiUrl}/${id}`);
  }

  getPickingReviews(id: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/${id}/reviews`);
  }
}
