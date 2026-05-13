import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactApiService {
  private readonly apiUrl = '/api/contact';

  constructor(private http: HttpClient) {}

  send(payload: ContactPayload): Observable<void> {
    return this.http.post<void>(this.apiUrl, payload);
  }
}
