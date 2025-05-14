import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { Event, EventService } from '../../../core/services/event.service';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common'; // Import CommonModule, DatePipe, CurrencyPipe

@Component({
  selector: 'app-admin-event-list',
  standalone: true, // Added standalone: true
  imports: [CommonModule, DatePipe, CurrencyPipe], // Added imports for CommonModule, DatePipe, CurrencyPipe
  templateUrl: './admin-event-list.component.html',
  styleUrls: ['./admin-event-list.component.css']
})
export class AdminEventListComponent implements OnInit {
  events$: Observable<Event[]>;
  isLoading$ = new BehaviorSubject<boolean>(true);
  error: string | null = null;

  constructor(private eventService: EventService, private router: Router) {
    this.events$ = this.eventService.getEvents();
  }

  ngOnInit(): void {
    this.events$.subscribe({
      next: () => this.isLoading$.next(false),
      error: (err) => {
        this.error = 'Failed to load events.';
        this.isLoading$.next(false);
        console.error(err);
      }
    });
  }

  editEvent(eventId: string): void {
    this.router.navigate(['/admin/events/edit', eventId]);
  }

  deleteEvent(eventId: string): void {
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(eventId).subscribe({
        next: () => {
          // Refresh the list or provide feedback
          // For now, we rely on the BehaviorSubject in the service to update the view
        },
        error: (err) => {
          this.error = 'Failed to delete event.';
          console.error(err);
        }
      });
    }
  }

  navigateToCreateEvent(): void {
    this.router.navigate(['/admin/events/new']);
  }
}
