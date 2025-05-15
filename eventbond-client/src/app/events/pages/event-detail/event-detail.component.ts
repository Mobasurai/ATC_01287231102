import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, throwError } from 'rxjs';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Event, EventService, EventImage } from '../../../core/services/event.service';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService, User } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { tap, catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit, OnDestroy {
  event: Event | null = null;
  isLoading = true;
  error: string | null = null;
  selectedImageUrl: string | null = null;
  bookingMessage: string | null = null;
  bookingMessageType: 'success' | 'error' | null = null;
  isBooking = false;
  private routeSub: Subscription | undefined;
  private bookingSub: Subscription | undefined;
  private userId: number | null = null;
  numberOfTicketsToBook: number = 1;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private bookingService: BookingService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const eventId = params.get('id');
      if (eventId) {
        this.isLoading = true;

        this.eventService.getEventById(eventId).pipe(
          tap(eventData => {
            try {
              if (eventData) {
                this.event = eventData;
                this.error = null;
                if (this.event.title) {
                  document.title = `EventBond - ${this.event.title}`;
                }
                if (this.event.imageUrl && (this.event.imageUrl.startsWith('http') || this.event.imageUrl.startsWith('https'))) {
                  this.selectedImageUrl = this.event.imageUrl;
                } else if (this.event.images && this.event.images.length > 0) {
                  let initialImage = this.event.images.find(img => img.isPrimary);
                  if (!initialImage) {
                    initialImage = this.event.images[0];
                  }
                  this.selectedImageUrl = initialImage ? this.constructImageUrl(initialImage) : '';
                } else {
                  this.selectedImageUrl = '';
                }
              } else {
                this.event = null;
                this.error = 'Event not found.';
                this.selectedImageUrl = '';
              }
            } catch (processingError) {
              this.event = null;
              this.error = 'Failed to process event details.';
              this.selectedImageUrl = '';
            }
          }),
          catchError(err => {
            this.event = null;
            this.error = 'Failed to load event details.';
            this.selectedImageUrl = '';
            this.isLoading = false;
            return throwError(() => new Error('Failed to load event details. Original: ' + (err.message || JSON.stringify(err))));
          }),
          finalize(() => {
            this.isLoading = false;
            this.cdr.detectChanges(); 
          })
        ).subscribe();
      } else {
        this.error = 'Event ID not provided.';
        this.isLoading = false;
        this.selectedImageUrl = '';
        this.cdr.detectChanges();
      }
    });

    this.authService.currentUser$.subscribe((user: User | null) => {
      this.userId = user ? user.id : null;
    });
  }

  constructImageUrl(image: EventImage): string {
    if (!image || image.id === undefined) {
      return 'Image ID is missing';
    }

    if (image.imagePath && (image.imagePath.startsWith('http://') || image.imagePath.startsWith('https://'))) {
      return image.imagePath;
    }

    const apiUrl = environment.apiUrl.endsWith('/') ? environment.apiUrl.slice(0, -1) : environment.apiUrl;
    const imageServeEndpoint = '/eventImages/getImage/'; 
    const fullUrl = `${apiUrl}${imageServeEndpoint}${image.id}`;
    return fullUrl;
  }

  selectImage(image: EventImage): void {
    this.selectedImageUrl = this.constructImageUrl(image);
  }

  bookEvent(): void {
    if (!this.event) {
      this.bookingMessage = 'Event not available.';
      this.bookingMessageType = 'error';
      return;
    }
    if (!this.userId) {
      this.bookingMessage = 'Please log in to book tickets.';
      this.bookingMessageType = 'error';
      return;
    }
    if (this.numberOfTicketsToBook <= 0) {
      this.bookingMessage = 'Please enter a valid number of tickets.';
      this.bookingMessageType = 'error';
      return;
    }
    if (this.event.availableTickets !== undefined && this.numberOfTicketsToBook > this.event.availableTickets) {
        this.bookingMessage = `Only ${this.event.availableTickets} tickets available.`;
        this.bookingMessageType = 'error';
        return;
    }

    this.isBooking = true;
    this.bookingMessage = null;
    this.bookingMessageType = null;

    this.bookingSub = this.bookingService.createBooking(this.event.id, this.numberOfTicketsToBook).subscribe(
      (response) => {
        this.bookingMessage = response.message;
        this.bookingMessageType = response.success ? 'success' : 'error';
        this.isBooking = false;
        if (response.success && this.event) {
            this.eventService.getEventById(this.event.id.toString()).subscribe(updatedEvent => {
                if (updatedEvent) {
                    this.event = updatedEvent;
                    this.cdr.detectChanges();
                }
            });
        }
        this.cdr.detectChanges();
      },
      (error) => {
        this.bookingMessage = error.message || 'Booking failed.';
        this.bookingMessageType = 'error';
        this.isBooking = false;
        this.cdr.detectChanges();
      }
    );
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.bookingSub) {
      this.bookingSub.unsubscribe();
    }
  }

  goBack(): void {
    this.router.navigate(['/events']);
  }

  incrementTickets(): void {
    if (this.event && this.event.availableTickets !== undefined && this.numberOfTicketsToBook < this.event.availableTickets) {
      this.numberOfTicketsToBook++;
    }
  }

  decrementTickets(): void {
    if (this.numberOfTicketsToBook > 1) {
      this.numberOfTicketsToBook--;
    }
  }
}
