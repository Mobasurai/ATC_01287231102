import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError, switchMap, tap, filter, take } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService, User } from './auth.service';
import { EventService, Event } from './event.service';
import { environment } from '../../../environments/environment'; 

export interface Booking {
  id: string;
  eventId: string;
  userId: string;
  bookingDate: string;
  numberOfTickets?: number;
  status?: string;
  event?: Event;
  eventName?: string;
  eventDate?: string;
  eventLocation?: string;
  eventImageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`; 
  private userBookingsSubject = new BehaviorSubject<Booking[]>([]);
  public userBookings$: Observable<Booking[]> = this.userBookingsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private eventService: EventService
  ) {
    this.authService.currentUser$.pipe(
      switchMap(user => {
        if (user && user.id) {
          return this.getUserBookings(); 
        } else {
          this.userBookingsSubject.next([]); 
          return of([]);
        }
      })
    ).subscribe();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getUserBookings(): Observable<Booking[]> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.userBookingsSubject.next([]); 
      return of([]);
    }
    
    return this.http.get<Booking[]>(`${this.apiUrl}/getUserBookings`).pipe(
      tap(bookings => this.userBookingsSubject.next(bookings)),
      catchError(this.handleError)
    );
  }

  createBooking(eventId: string, numberOfTickets: number): Observable<any> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return throwError(() => new Error('User not logged in'));
    }
    
    return this.http.post<Booking>(`${this.apiUrl}/createBooking`, { eventId, userId, numberOfTickets }).pipe(
      tap(newBooking => {
        const currentBookings = this.userBookingsSubject.getValue();
        this.userBookingsSubject.next([...currentBookings, newBooking]);
      }),
      map(response => ({ success: true, message: 'Booking successful!', booking: response })),
      catchError(err => {
        return of({ success: false, message: err.error?.message || 'Booking failed. Please try again.' });
      })
    );
  }

  cancelBooking(bookingId: string): Observable<any> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${bookingId}/cancel`, {}).pipe(
      tap(() => {
        const currentBookings = this.userBookingsSubject.getValue();
        const updatedBookings = currentBookings.map(b => 
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        );
        this.userBookingsSubject.next(updatedBookings);
      }),
      map(response => ({ success: true, message: response.message || 'Booking cancelled successfully.'})),
      catchError(err => {
        return of({ success: false, message: err.error?.message || 'Failed to cancel booking.' });
      })
    );
  }

  refreshUserBookings(): void {
    this.authService.currentUser$.pipe(
      filter(user => !!user),
      map(user => user!.id),
      take(1),
      switchMap(userId => this.getUserBookings())
    ).subscribe();
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred in BookingService!';
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
    console.error('BookingService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
