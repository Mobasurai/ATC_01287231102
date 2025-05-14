import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment'; // Ensure correct path

export interface EventImage {
  id: number; // Database ID of the image
  imagePath: string; // Path or filename of the image
  isPrimary?: boolean;
  // 'url' or 'imageUrl' here is not strictly needed if we always use EventImageService.getImageUrl(id)
  // However, if the backend includes a direct path or filename in the Event.images array, it could be here.
  // For consistency with EventImageController serving by ID, only 'id' and 'isPrimary' are essential from the Event object.
}

export interface Category {
  id: number; // Changed from string to number
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
  availableTickets: number; // Added this line
  imageUrl?: string; // A general image URL, could be a primary one or an external link. Treat with care.
  images?: EventImage[]; // Array of specific event images managed by our backend
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
  private apiUrl = `${environment.apiUrl}/events`; // Use environment.apiUrl

  private eventsSubject = new BehaviorSubject<Event[]>([]);
  public events$ = this.eventsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getEvents(): Observable<Event[]> {
    return this.http.get<ApiEventResponse>(`${this.apiUrl}/getEvents`).pipe( // Changed to /getEvents
      map(response => response.data), // Extract events from the data property
      tap(events => this.eventsSubject.next(events)),
      catchError(this.handleError)
    );
  }

  getEventById(id: string): Observable<Event | undefined> {
    console.log(`[EventService] getEventById: Fetching event with ID: ${id}`);
    return this.http.get<Event>(`${this.apiUrl}/getEvent/${id}`).pipe( // Changed ApiSingleEventResponse to Event
      tap(response => {
        console.log(`[EventService] getEventById: Raw response for ID ${id}:`, response);
      }),
      catchError(this.handleError) // handleError will be called for HTTP errors (4xx, 5xx)
    );
  }

  createEvent(eventData: any): Observable<Event> { // Changed from FormData to any (or specific DTO type)
    return this.http.post<Event>(`${this.apiUrl}/createEvent`, eventData).pipe( // Changed to /createEvent
      tap((newEvent) => {
        const currentEvents = this.eventsSubject.getValue();
        // Safeguard: Ensure currentEvents is an array before spreading
        const updatedEvents = Array.isArray(currentEvents) ? [...currentEvents, newEvent] : [newEvent];
        this.eventsSubject.next(updatedEvents);
      }),
      catchError(this.handleError)
    );
  }

  updateEvent(id: string, eventData: any): Observable<Event> { // Changed from FormData to any (or specific DTO type)
    return this.http.put<Event>(`${this.apiUrl}/updateEvent/${id}`, eventData).pipe( // Changed to /updateEvent/:id
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
        
        // Assuming updatedEvent.id is the reliable ID from the backend response
        const index = currentEvents.findIndex(e => e.id === updatedEvent.id);
        if (index !== -1) {
          const newEventsArray = [...currentEvents]; // Create a new array instance
          newEventsArray[index] = updatedEvent;
          this.eventsSubject.next(newEventsArray);
        } else {
          // Optionally, if the event is not found, add it to the list
          // console.warn('EventService: updatedEvent not found in currentEvents. Adding it.');
          // this.eventsSubject.next([...currentEvents, updatedEvent]);
        }
      }),
      catchError(this.handleError)
    );
  }

  // New method for creating an event with files
  createEventWithFiles(formData: FormData): Observable<Event> {
    // Note: HttpClient will automatically set Content-Type to multipart/form-data
    return this.http.post<Event>(`${this.apiUrl}/createEvent`, formData).pipe(
      tap((newEvent) => {
        const currentEvents = this.eventsSubject.getValue();
        const updatedEvents = Array.isArray(currentEvents) ? [...currentEvents, newEvent] : [newEvent];
        this.eventsSubject.next(updatedEvents);
      }),
      catchError(this.handleError)
    );
  }

  // New method for updating an event with files
  updateEventWithFiles(id: string, formData: FormData): Observable<Event> {
    // Note: HttpClient will automatically set Content-Type to multipart/form-data
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
          // Optionally handle if event not found, though update implies it should exist
          // this.eventsSubject.next([...currentEvents, updatedEvent]);
        }
      }),
      catchError(this.handleError)
    );
  }

  deleteEvent(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteEvent/${id}`).pipe( // Changed to /deleteEvent/:id
      tap(() => {
        const currentEvents = this.eventsSubject.getValue();
        // Ensure currentEvents is an array before filtering
        if (Array.isArray(currentEvents)) {
          this.eventsSubject.next(currentEvents.filter(e => e.id !== id));
        } else {
          // Handle the case where currentEvents is not an array, perhaps by re-fetching or logging
          console.warn('Events subject was not an array during delete operation. Re-fetching events.');
          this.getEvents().subscribe(); // Re-fetch to ensure consistency
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
