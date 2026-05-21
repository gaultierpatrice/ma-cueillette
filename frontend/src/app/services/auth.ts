import { Injectable } from '@angular/core';

interface JwtClaims {
  name?: string;
  farmName?: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'auth_token';

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  private parsePayload(): JwtClaims | null {
    const token = this.getToken();
    if (!token) return null;
    const part = token.split('.')[1];
    if (!part) return null;
    try {
      const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
      const pad = '='.repeat((4 - (base64.length % 4)) % 4);
      return JSON.parse(atob(base64 + pad)) as JwtClaims;
    } catch {
      return null;
    }
  }

  getUsername(): string {
    return this.parsePayload()?.name ?? '';
  }

  getFarmName(): string {
    return this.parsePayload()?.farmName ?? '';
  }

  getUserRole(): string {
    return this.parsePayload()?.role ?? '';
  }

  isProducer(): boolean {
    return this.getUserRole() === 'PRODUCER';
  }
}
