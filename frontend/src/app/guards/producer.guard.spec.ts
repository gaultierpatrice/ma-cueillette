import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../services/auth';
import { producerGuard } from './producer.guard';

describe('producerGuard', () => {
  let createUrlTree: ReturnType<typeof vi.fn>;
  let authMock: { isLoggedIn: ReturnType<typeof vi.fn>; isProducer: ReturnType<typeof vi.fn> };

  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/add-picking' } as RouterStateSnapshot;

  beforeEach(() => {
    createUrlTree = vi.fn((commands: string[], extras?: { queryParams?: Record<string, string> }) => ({
      commands,
      queryParams: extras?.queryParams,
    }));
    authMock = {
      isLoggedIn: vi.fn(),
      isProducer: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: { createUrlTree } },
      ],
    });
  });

  function runGuard(): unknown {
    return TestBed.runInInjectionContext(() => producerGuard(route, state));
  }

  it('redirects to login with returnUrl when not logged in', () => {
    authMock.isLoggedIn.mockReturnValue(false);

    runGuard();

    expect(createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/add-picking' },
    });
  });

  it('redirects to dashboard when logged in but not a producer', () => {
    authMock.isLoggedIn.mockReturnValue(true);
    authMock.isProducer.mockReturnValue(false);

    const result = runGuard();

    expect(createUrlTree).toHaveBeenCalledWith(['/dashboard']);
    expect(result).not.toBe(true);
  });

  it('allows access when logged in as producer', () => {
    authMock.isLoggedIn.mockReturnValue(true);
    authMock.isProducer.mockReturnValue(true);

    expect(runGuard()).toBe(true);
    expect(createUrlTree).not.toHaveBeenCalled();
  });
});
