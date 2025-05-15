import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, tap, catchError, switchMap } from 'rxjs/operators'; 
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment'; 

export interface User {
  id: number; 
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
  private authApiUrl = `${environment.apiUrl}/auth`; 
  private usersApiUrl = `${environment.apiUrl}/users`; 

  private currentUserSubject$: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject$.asObservable();

  private currentAdminSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isAdmin$: Observable<boolean> = this.currentAdminSubject$.asObservable();
  public redirectUrl: string | null = null; 

  constructor(private router: Router, private http: HttpClient) {
    this.loadInitialUser().subscribe({ 
      error: (err) => console.error('Error during initial user load:', err)
    });
  }

  private loadInitialUser(): Observable<User | null> { 
    const token = localStorage.getItem('authToken');
    if (token) {
      
      return this.fetchCurrentUser(); 
    } else {
      
      this.currentUserSubject$.next(null);
      this.currentAdminSubject$.next(false);
      return of(null); 
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
          console.log('User set in signin:', user); 
          return of(user); 
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
        this.logout(); 
        return of(null);
      }

      const user: User = {
        id: decodedToken.sub,       
        username: decodedToken.username,
        email: decodedToken.email,
        role: decodedToken.role || 'user',
        token: token 
      };

      this.currentUserSubject$.next(user);
      this.currentAdminSubject$.next(user.role === 'admin');
      console.log('User restored from token by fetchCurrentUser:', user);
      return of(user);

    } catch (error) {
      console.error('Error decoding token during fetchCurrentUser:', error);
      this.logout(); 
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

  public getCurrentUserId(): number | null { 
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
