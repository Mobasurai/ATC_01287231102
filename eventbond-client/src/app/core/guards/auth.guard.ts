import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, tap } from 'rxjs/operators'; // Added tap

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('[AuthGuard] Checking access for URL:', state.url);

  return authService.currentUser$.pipe(
    tap(user => {
      // Log the user object received by the guard
      console.log('[AuthGuard] currentUser$ emitted:', user);
    }),
    map(user => {
      if (user) {
        console.log('[AuthGuard] User found. Access granted.');
        return true;
      }
      console.log('[AuthGuard] User not found. Redirecting to /auth/signin. Return URL:', state.url);
      router.navigate(['/auth/signin'], { queryParams: { returnUrl: state.url } });
      return false;
    })
  );
};
