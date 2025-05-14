import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, throwError } from 'rxjs'; // Corrected: throwError imported from 'rxjs'
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Event, EventService, EventImage } from '../../../core/services/event.service';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService, User } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { tap, catchError, finalize } from 'rxjs/operators'; // finalize is correctly from operators

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
        console.log(`[EventDetail] ngOnInit: Fetching event with ID: ${eventId}`);

        this.eventService.getEventById(eventId).pipe(
          tap(eventData => {
            try {
              console.log('[EventDetail] API success, processing data:', eventData);
              if (eventData) {
                this.event = eventData;
                this.error = null; // Clear any previous error
                if (this.event.title) {
                  document.title = `EventBond - ${this.event.title}`;
                }
                // Initialize selectedImageUrl
                if (this.event.imageUrl && (this.event.imageUrl.startsWith('http') || this.event.imageUrl.startsWith('https'))) {
                  this.selectedImageUrl = this.event.imageUrl;
                } else if (this.event.images && this.event.images.length > 0) {
                  let initialImage = this.event.images.find(img => img.isPrimary);
                  if (!initialImage) {
                    initialImage = this.event.images[0];
                  }
                  this.selectedImageUrl = initialImage ? this.constructImageUrl(initialImage) : 'https://via.placeholder.com/600x400.png?text=Event+Image';
                } else {
                  this.selectedImageUrl = 'https://via.placeholder.com/600x400.png?text=Event+Image';
                }
                console.log('[EventDetail] Event data processed. Event:', this.event, 'Selected Image URL:', this.selectedImageUrl);
              } else {
                this.event = null;
                this.error = 'Event not found.';
                this.selectedImageUrl = 'https://via.placeholder.com/600x400.png?text=Event+Not+Found';
                console.log('[EventDetail] Event data is null or undefined. Error set to "Event not found".');
              }
            } catch (processingError) {
              console.error('[EventDetail] Error processing event data:', processingError);
              this.event = null;
              this.error = 'Failed to process event details.';
              this.selectedImageUrl = 'https://via.placeholder.com/600x400.png?text=Processing+Error';
            }
          }),
          catchError(err => {
            console.error('[EventDetail] API error caught in catchError:', err);
            this.event = null;
            this.error = 'Failed to load event details.';
            this.selectedImageUrl = 'https://via.placeholder.com/600x400.png?text=Error+Loading';
            this.isLoading = false; // Set isLoading to false here as well
            return throwError(() => new Error('Failed to load event details. Original: ' + (err.message || JSON.stringify(err))));
          }),
          finalize(() => {
            this.isLoading = false; // Ensure isLoading is set to false before change detection
            console.log('[EventDetail] API call finalized. isLoading set to false. Current state - Event:', this.event, 'Error:', this.error, 'isLoading:', this.isLoading);
            this.cdr.detectChanges(); 
            console.log('[EventDetail] Change detection triggered in finalize.');
          })
        ).subscribe({
          next: () => {
            console.log('[EventDetail] Subscription next handler. Event:', this.event, 'Error:', this.error, 'isLoading:', this.isLoading);
          },
          error: (err) => {
            console.error('[EventDetail] Subscription error handler (error re-thrown by catchError):', err.message);
          }
        });
      } else {
        this.error = 'Event ID not provided.';
        this.isLoading = false;
        this.selectedImageUrl = 'https://via.placeholder.com/600x400.png?text=No+Event+ID';
        console.log('[EventDetail] No Event ID provided. isLoading set to false.');
        this.cdr.detectChanges();
      }
    });

    this.authService.currentUser$.subscribe((user: User | null) => {
      this.userId = user ? user.id : null;
      console.log('[EventDetail] User ID set:', this.userId);
    });
  }

  constructImageUrl(image: EventImage): string {
    // The 'image' object should have an 'id' property (the EventImage entity's ID)
    // and 'imagePath' (the filename, though we might not need it directly here if serving by ID)
    if (!image || image.id === undefined) { // Check for image and image.id
      console.warn('[EventDetail] constructImageUrl: Image or image ID is missing.', image);
      return 'https://via.placeholder.com/600x400.png?text=Image+ID+Missing';
    }

    // Check if imagePath itself is already a full URL (e.g., from a previous version or external source)
    // This part might be less relevant now if all images are served via our backend by ID.
    if (image.imagePath && (image.imagePath.startsWith('http://') || image.imagePath.startsWith('https://'))) {
      console.log('[EventDetail] constructImageUrl: Path is already a full URL:', image.imagePath);
      return image.imagePath;
    }

    const apiUrl = environment.apiUrl.endsWith('/') ? environment.apiUrl.slice(0, -1) : environment.apiUrl;
    // Corrected endpoint to fetch image by its ID from EventImageController
    const imageServeEndpoint = '/eventImages/getImage/'; 
    const fullUrl = `${apiUrl}${imageServeEndpoint}${image.id}`;
    console.log('[EventDetail] constructImageUrl: Constructed URL:', fullUrl);
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
      (response) => { // Next callback
        this.bookingMessage = response.message; // Use message from service response
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
      (error) => { // Error callback
        this.bookingMessage = error.message || 'Booking failed due to an unexpected error.';
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
