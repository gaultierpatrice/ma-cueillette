import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth';

function isUserLoginRequest(url: string): boolean {
  return url.includes('/api/users/login');
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();
  const authReq =
    token && !req.headers.has('Authorization')
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(authReq).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401 && !isUserLoginRequest(req.url)) {
        auth.logout();
        const path = router.url.split('?')[0];
        if (path !== '/login' && path !== '/register') {
          void router.navigate(['/login']);
        }
      }
      return throwError(() => err);
    }),
  );
};
