import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, tap } from 'rxjs/operators'; 

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('[AuthGuard] Checking access for URL:', state.url);

  return authService.currentUser$.pipe(
    map(user => {
      if (user) {
        return true;
      }
      router.navigate(['/auth/signin'], { queryParams: { returnUrl: state.url } });
      return false;
    })
  );
};
