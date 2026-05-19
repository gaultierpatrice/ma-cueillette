import {
  HttpClient,
  HttpHeaders,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../services/auth';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let auth: AuthService;
  let navigate: ReturnType<typeof vi.fn>;
  let routerUrl: string;

  beforeEach(() => {
    navigate = vi.fn();
    routerUrl = '/dashboard';

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        AuthService,
        {
          provide: Router,
          useValue: {
            get url() {
              return routerUrl;
            },
            navigate,
          },
        },
      ],
    });

    localStorage.clear();
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    auth.saveToken('test-token');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('adds Authorization header when a token is present', () => {
    http.get('/api/pickings').subscribe();

    const req = httpMock.expectOne('/api/pickings');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush([]);
  });

  it('does not override an existing Authorization header', () => {
    http
      .get('/api/pickings', {
        headers: new HttpHeaders({ Authorization: 'Bearer custom' }),
      })
      .subscribe();

    const req = httpMock.expectOne('/api/pickings');
    expect(req.request.headers.get('Authorization')).toBe('Bearer custom');
    req.flush([]);
  });

  it('does not add Authorization when no token is stored', () => {
    auth.logout();

    http.get('/api/pickings').subscribe();

    const req = httpMock.expectOne('/api/pickings');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('logs out and navigates to login on 401 for protected requests', () => {
    http.get('/api/pickings').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/pickings');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(auth.getToken()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });

  it('does not navigate on 401 when already on the login page', () => {
    routerUrl = '/login';

    http.get('/api/pickings').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/pickings');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(auth.getToken()).toBeNull();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('does not log out on 401 for the login endpoint', () => {
    http.post('/api/users/login', { email: 'a@b.com', password: 'x' }).subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/users/login');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(auth.getToken()).toBe('test-token');
    expect(navigate).not.toHaveBeenCalled();
  });
});
