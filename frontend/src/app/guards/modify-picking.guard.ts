import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth';
import { PickingService } from '../services/picking.service';

export const modifyPickingGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const pickingService = inject(PickingService);
  const router = inject(Router);

  if (!auth.isLoggedIn() || !auth.isProducer()) {
    return router.createUrlTree(['/dashboard']);
  }

  return pickingService.getMyPicking().pipe(
    map((picking) => (picking ? true : router.createUrlTree(['/add-picking']))),
    catchError(() => of(router.createUrlTree(['/add-picking']))),
  );
};
