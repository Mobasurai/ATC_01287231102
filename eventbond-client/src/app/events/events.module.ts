import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventsRoutingModule } from './events-routing.module';
import { EventListComponent } from './pages/event-list/event-list.component';
import { EventDetailComponent } from './pages/event-detail/event-detail.component';
import { EventCardComponent } from './components/event-card/event-card.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    EventsRoutingModule,
    EventListComponent,
    EventDetailComponent,
    EventCardComponent
  ]
})
export class EventsModule { }
