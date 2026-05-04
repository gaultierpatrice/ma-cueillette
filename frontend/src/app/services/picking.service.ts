import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Picking } from './picking.types';

@Injectable({
  providedIn: 'root'
})
export class PickingService {
  private apiUrl = 'http://localhost:8080/api/pickings';

  constructor(private http: HttpClient) {}

  getAllPickings(): Observable<Picking[]> {
    return this.http.get<Picking[]>(this.apiUrl);
  }
}
