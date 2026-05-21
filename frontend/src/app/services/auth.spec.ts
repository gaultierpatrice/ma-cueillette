import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AuthService } from './auth';

/** Builds a minimal JWT-shaped string with a base64url-encoded payload (no crypto). */
function jwtWithPayload(payload: Record<string, unknown>): string {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `header.${encoded}.signature`;
}

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('persists and reads the auth token', () => {
    service.saveToken('my-token');
    expect(service.getToken()).toBe('my-token');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('logout removes the token', () => {
    service.saveToken('my-token');
    service.logout();
    expect(service.getToken()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('parses username, farm name, and role from a valid JWT payload', () => {
    const token = jwtWithPayload({
      name: 'Alice',
      farmName: 'La Ferme',
      role: 'PRODUCER',
    });
    service.saveToken(token);

    expect(service.getUsername()).toBe('Alice');
    expect(service.getFarmName()).toBe('La Ferme');
    expect(service.getUserRole()).toBe('PRODUCER');
    expect(service.isProducer()).toBe(true);
  });

  it('isProducer is false for non-producer roles', () => {
    service.saveToken(jwtWithPayload({ role: 'USER' }));
    expect(service.isProducer()).toBe(false);
  });

  it('returns empty strings when the token has no payload segment', () => {
    service.saveToken('not-a-jwt');
    expect(service.getUsername()).toBe('');
    expect(service.getFarmName()).toBe('');
    expect(service.getUserRole()).toBe('');
    expect(service.isProducer()).toBe(false);
  });

  it('returns empty strings when the payload is not valid base64 JSON', () => {
    service.saveToken('a.!!!invalid!!!.b');
    expect(service.getUsername()).toBe('');
    expect(service.getUserRole()).toBe('');
  });

  it('returns empty strings when no token is stored', () => {
    expect(service.getUsername()).toBe('');
    expect(service.isProducer()).toBe(false);
  });
});
