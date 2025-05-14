import { Component, OnInit } from '@angular/core';
import { Event, EventService } from '../../../core/services/event.service'; // Corrected path
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { EventCardComponent } from '../../components/event-card/event-card.component'; // Corrected path
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, EventCardComponent, RouterModule],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {
  events$: Observable<Event[]> | undefined;

  constructor(private eventService: EventService) { }

  ngOnInit(): void {
    this.events$ = this.eventService.getEvents();
  }
}
