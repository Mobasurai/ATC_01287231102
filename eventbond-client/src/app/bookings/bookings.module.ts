import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BookingsRoutingModule } from './bookings-routing.module';
import { BookingListComponent } from './pages/booking-list/booking-list.component';


@NgModule({
  declarations: [
    // No declarations needed as BookingListComponent is standalone
  ],
  imports: [
    CommonModule,
    BookingsRoutingModule,
    BookingListComponent // Import standalone component
  ]
})
export class BookingsModule { }
