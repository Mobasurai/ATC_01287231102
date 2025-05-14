import { Component, OnInit } from '@angular/core';
import { Booking, BookingService } from '../../../core/services/booking.service'; // Corrected path
import { AuthService } from '../../../core/services/auth.service'; // Corrected path
import { Event } from '../../../core/services/event.service'; // Import Event interface
import { Observable } from 'rxjs';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common'; // Removed CurrencyPipe
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, TitleCasePipe], // Removed CurrencyPipe
  templateUrl: './booking-list.component.html',
  styleUrls: ['./booking-list.component.css']
})
export class BookingListComponent implements OnInit {
  bookings$: Observable<Booking[]> | undefined;
  // For user feedback, e.g., after cancelling a booking
  feedbackMessage: string | null = null;
  feedbackType: 'success' | 'error' | null = null;

  constructor(
    private bookingService: BookingService,
    public authService: AuthService // Made public for potential use in template, though not strictly needed here
  ) { }

  ngOnInit(): void {
    this.bookings$ = this.bookingService.userBookings$;
    // Optionally, subscribe to see console logs or for debugging
    // this.bookings$.subscribe(bookings => console.log('Bookings in component:', bookings));
  }

  getEventImageUrl(event: Event | undefined): string {
    if (event?.images && event.images.length > 0) {
      const primaryImage = event.images.find(img => img.isPrimary);
      if (primaryImage?.imagePath) {
        return primaryImage.imagePath;
      }
      // Ensure event.images[0] exists and has imagePath before accessing
      if (event.images[0]?.imagePath) {
        return event.images[0].imagePath; // Fallback to the first image
      }
    }
    if (event?.imageUrl) {
      return event.imageUrl; // Fallback to the main imageUrl
    }
    return 'https://via.placeholder.com/300x200.png?text=Event+Image'; // Default placeholder
  }

  cancelBooking(bookingId: string): void {
    if (!bookingId) return;

    // Optimistic UI update can be done here if desired, or wait for service confirmation
    this.bookingService.cancelBooking(bookingId).subscribe({
      next: (response) => {
        if (response.success) {
          this.showFeedback('Booking cancelled successfully.', 'success');
          // The bookings$ observable should update automatically from the service
        } else {
          this.showFeedback(response.message || 'Failed to cancel booking.', 'error');
        }
      },
      error: (err) => {
        console.error('Error cancelling booking:', err);
        this.showFeedback('An unexpected error occurred while cancelling the booking.', 'error');
      }
    });
  }

  private showFeedback(message: string, type: 'success' | 'error', duration: number = 3000): void {
    this.feedbackMessage = message;
    this.feedbackType = type;
    setTimeout(() => {
      this.feedbackMessage = null;
      this.feedbackType = null;
    }, duration);
  }
}
