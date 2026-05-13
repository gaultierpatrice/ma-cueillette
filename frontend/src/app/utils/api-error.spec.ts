import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';

import { getApiErrorMessage } from './api-error';

describe('getApiErrorMessage', () => {
  it('reads message from ApiError JSON body', () => {
    const err = new HttpErrorResponse({
      status: 409,
      statusText: 'Conflict',
      url: '/api/users/register',
      error: {
        status: 409,
        message: 'Email already in use',
        path: '/api/users/register',
      },
    });

    expect(getApiErrorMessage(err, 'fallback')).toBe('Email already in use');
  });

  it('uses fallback when body has no message', () => {
    const err = new HttpErrorResponse({
      status: 500,
      error: {},
    });

    expect(getApiErrorMessage(err, 'fallback')).toBe('fallback');
  });

  it('uses string body when returned as text', () => {
    const err = new HttpErrorResponse({
      status: 400,
      error: 'plain error',
    });

    expect(getApiErrorMessage(err, 'fallback')).toBe('plain error');
  });
});
