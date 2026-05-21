import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { RegisterPayload, LoginPayload, LoginResponse } from './user.types';
import { getApiRoot } from './api-config';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = `${getApiRoot()}/users`;

  constructor(private http: HttpClient) {}

  register(payload: RegisterPayload): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/register`, payload);
  }

  login(payload: LoginPayload): Observable<{ token: string }> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, payload);
  }

  deleteAccount(): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/delete`);
  }
}
