import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, afterEach } from 'vitest';

import { UserService } from './user';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  afterEach(() => {
    httpMock.verify();
  });

  it('posts login to /api/users/login', () => {
    TestBed.configureTestingModule({
      providers: [UserService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);

    service.login({ email: 'a@b.com', password: 'secret' }).subscribe((res) => {
      expect(res.token).toBe('t');
    });

    const req = httpMock.expectOne('/api/users/login');
    expect(req.request.method).toBe('POST');
    req.flush({ token: 't' });
  });
});
