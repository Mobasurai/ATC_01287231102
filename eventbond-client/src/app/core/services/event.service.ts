import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface EventImage {
  id: number; 
  imagePath: string;
  isPrimary?: boolean;
}

export interface Category {
  id: number; 
  name: string;
}

export interface Event {
  id: string; 
  title: string; 
  description: string;
  startDate: string; 
  venue: string; 
  organizer: string; 
  category: Category; 
  price: number;
  seatsAvailable: number;
  availableTickets: number; 
  imageUrl?: string; 
  images?: EventImage[]; 
}

export interface ApiEventResponse {
  data: Event[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiSingleEventResponse {
  data: Event;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/events`; 

  private eventsSubject = new BehaviorSubject<Event[]>([]);
  public events$ = this.eventsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getEvents(): Observable<Event[]> {
    return this.http.get<ApiEventResponse>(`${this.apiUrl}/getEvents`).pipe( 
      map(response => response.data), 
      tap(events => this.eventsSubject.next(events)),
      catchError(this.handleError)
    );
  }

  getEventById(id: string): Observable<Event | undefined> {
    console.log(`[EventService] getEventById: Fetching event with ID: ${id}`);
    return this.http.get<Event>(`${this.apiUrl}/getEvent/${id}`).pipe( 
      tap(response => {
        console.log(`[EventService] getEventById: Raw response for ID ${id}:`, response);
      }),
      catchError(this.handleError) 
    );
  }

  createEvent(eventData: any): Observable<Event> { 
    return this.http.post<Event>(`${this.apiUrl}/createEvent`, eventData).pipe( 
      tap((newEvent) => {
        const currentEvents = this.eventsSubject.getValue();
        
        const updatedEvents = Array.isArray(currentEvents) ? [...currentEvents, newEvent] : [newEvent];
        this.eventsSubject.next(updatedEvents);
      }),
      catchError(this.handleError)
    );
  }

  updateEvent(id: string, eventData: any): Observable<Event> { 
    return this.http.put<Event>(`${this.apiUrl}/updateEvent/${id}`, eventData).pipe( 
      tap((updatedEvent) => {
        let currentEvents = this.eventsSubject.getValue();
        if (!Array.isArray(currentEvents)) {
          console.error(
            'EventService: currentEvents in updateEvent was not an array. Current value:',
            currentEvents,
            'Resetting to [updatedEvent]. This may indicate an issue with events loading.'
          );
          this.eventsSubject.next([updatedEvent]);
          return;
        }
        
        
        const index = currentEvents.findIndex(e => e.id === updatedEvent.id);
        if (index !== -1) {
          const newEventsArray = [...currentEvents]; 
          newEventsArray[index] = updatedEvent;
          this.eventsSubject.next(newEventsArray);
        } else {
          
          
          
        }
      }),
      catchError(this.handleError)
    );
  }

  
  createEventWithFiles(formData: FormData): Observable<Event> {
    
    return this.http.post<Event>(`${this.apiUrl}/createEvent`, formData).pipe(
      tap((newEvent) => {
        const currentEvents = this.eventsSubject.getValue();
        const updatedEvents = Array.isArray(currentEvents) ? [...currentEvents, newEvent] : [newEvent];
        this.eventsSubject.next(updatedEvents);
      }),
      catchError(this.handleError)
    );
  }

  
  updateEventWithFiles(id: string, formData: FormData): Observable<Event> {
    
    return this.http.put<Event>(`${this.apiUrl}/updateEvent/${id}`, formData).pipe(
      tap((updatedEvent) => {
        let currentEvents = this.eventsSubject.getValue();
        if (!Array.isArray(currentEvents)) {
          console.error(
            'EventService: currentEvents in updateEventWithFiles was not an array. Current value:',
            currentEvents,
            'Resetting to [updatedEvent]. This may indicate an issue with events loading.'
          );
          this.eventsSubject.next([updatedEvent]);
          return;
        }
        
        const index = currentEvents.findIndex(e => e.id === updatedEvent.id);
        if (index !== -1) {
          const newEventsArray = [...currentEvents];
          newEventsArray[index] = updatedEvent;
          this.eventsSubject.next(newEventsArray);
        } else {
          
          
        }
      }),
      catchError(this.handleError)
    );
  }

  deleteEvent(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteEvent/${id}`).pipe( 
      tap(() => {
        const currentEvents = this.eventsSubject.getValue();
        
        if (Array.isArray(currentEvents)) {
          this.eventsSubject.next(currentEvents.filter(e => e.id !== id));
        } else {
          
          console.warn('Events subject was not an array during delete operation. Re-fetching events.');
          this.getEvents().subscribe(); 
        }
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred in EventService!';
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
    console.error('EventService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
