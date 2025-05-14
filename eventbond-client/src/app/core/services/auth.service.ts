import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, tap, catchError, switchMap } from 'rxjs/operators'; // Added switchMap
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment'; // Import environment

export interface User {
  id: number; // Changed from string to number
  username: string;
  email: string;
  role: 'user' | 'admin';
  token?: string;
}

export interface AuthResponse {
  access_token: string;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authApiUrl = `${environment.apiUrl}/auth`; // For login, logout, /me
  private usersApiUrl = `${environment.apiUrl}/users`; // For signup (createUser)

  private currentUserSubject$: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject$.asObservable();

  private currentAdminSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isAdmin$: Observable<boolean> = this.currentAdminSubject$.asObservable();
  public redirectUrl: string | null = null; // Added redirectUrl property

  constructor(private router: Router, private http: HttpClient) {
    this.loadInitialUser().subscribe({ // Subscribe here to ensure it runs
      error: (err) => console.error('Error during initial user load:', err)
    });
  }

  private loadInitialUser(): Observable<User | null> { // Return Observable
    const token = localStorage.getItem('authToken');
    if (token) {
      // If a token exists, try to validate it by fetching the current user.
      return this.fetchCurrentUser(); // Return the observable
    } else {
      // No token, ensure user is in a logged-out state.
      this.currentUserSubject$.next(null);
      this.currentAdminSubject$.next(false);
      return of(null); // Return an observable of null
    }
  }

  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }

  signin(credentials: { email: string, password: string }): Observable<User> {
    return this.http.post<AuthResponse>(`${this.authApiUrl}/login`, credentials)
      .pipe(
        switchMap(response => {
          const decodedToken: any = this.decodeToken(response.access_token);
          if (!decodedToken || decodedToken.exp * 1000 <= Date.now()) {
            localStorage.removeItem('authToken');
            this.currentUserSubject$.next(null);
            this.currentAdminSubject$.next(false);
            return throwError(() => new Error('Invalid or expired token.'));
          }
          const user: User = {
            id: decodedToken.sub,
            username: decodedToken.username,
            email: decodedToken.email,
            role: decodedToken.role || 'user',
            token: response.access_token
          };

          localStorage.setItem('authToken', response.access_token);
          this.currentUserSubject$.next(user);
          this.currentAdminSubject$.next(user.role === 'admin');
          console.log('User set in signin:', user); // Logging
          return of(user); // Return the user object wrapped in an observable
        }),
        catchError(this.handleError)
      );
  }

  signup(userData: any): Observable<User> {
    const payload = { ...userData, role: userData.role || 'user' }; 
    return this.http.post<User>(`${this.usersApiUrl}/createUser`, payload)
      .pipe(
        tap(user => {
          console.log('Signup successful, user created:', user);
        }),
        catchError(this.handleError)
      );
  }

  fetchCurrentUser(): Observable<User | null> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      this.currentUserSubject$.next(null);
      this.currentAdminSubject$.next(false);
      return of(null);
    }

    try {
      const decodedToken: any = this.decodeToken(token);

      if (!decodedToken || (decodedToken.exp && decodedToken.exp * 1000 <= Date.now())) {
        console.error('Token is invalid or expired.');
        this.logout(); // Handles clearing token and subjects
        return of(null);
      }

      const user: User = {
        id: decodedToken.sub,       // Standard JWT claim for user ID
        username: decodedToken.username,
        email: decodedToken.email,
        role: decodedToken.role || 'user',
        token: token // Store the original token if needed elsewhere, though it's already in localStorage
      };

      this.currentUserSubject$.next(user);
      this.currentAdminSubject$.next(user.role === 'admin');
      console.log('User restored from token by fetchCurrentUser:', user);
      return of(user);

    } catch (error) {
      console.error('Error decoding token during fetchCurrentUser:', error);
      this.logout(); // Treat decoding errors as a reason to logout
      return of(null);
    }
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.currentUserSubject$.next(null);
    this.currentAdminSubject$.next(false);
    this.router.navigate(['/auth/signin']);
  }

  isAuthenticated(): Observable<boolean> {
    return this.currentUser$.pipe(map(user => !!user));
  }

  public getCurrentUserId(): number | null { // Changed return type from string | null
    const currentUser = this.currentUserSubject$.value;
    return currentUser ? currentUser.id : null;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && typeof error.error === 'object' && error.error.message) {
        errorMessage = Array.isArray(error.error.message) ? error.error.message.join(', ') : error.error.message;
      } else if (typeof error.error === 'string') {
        errorMessage = error.error;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
