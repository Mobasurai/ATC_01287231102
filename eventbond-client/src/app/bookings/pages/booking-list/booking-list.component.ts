import { Component, OnInit } from '@angular/core';
import { Booking, BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { Event } from '../../../core/services/event.service';
import { Observable } from 'rxjs';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, TitleCasePipe],
  templateUrl: './booking-list.component.html',
  styleUrls: ['./booking-list.component.css']
})
export class BookingListComponent implements OnInit {
  bookings$: Observable<Booking[]> | undefined;
  feedbackMessage: string | null = null;
  feedbackType: 'success' | 'error' | null = null;

  constructor(
    private bookingService: BookingService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.bookings$ = this.bookingService.userBookings$;
  }

  getEventImageUrl(event: Event | undefined): string {
    if (event?.images && event.images.length > 0) {
      const primaryImage = event.images.find(img => img.isPrimary);
      if (primaryImage?.imagePath) {
        return primaryImage.imagePath;
      }
      if (event.images[0]?.imagePath) {
        return event.images[0].imagePath;
      }
    }
    if (event?.imageUrl) {
      return event.imageUrl;
    }
    return '';
  }

  cancelBooking(bookingId: string): void {
    if (!bookingId) return;

    this.bookingService.cancelBooking(bookingId).subscribe({
      next: (response) => {
        if (response.success) {
          this.showFeedback('Booking cancelled successfully.', 'success');
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
