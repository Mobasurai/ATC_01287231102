import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BookingsRoutingModule } from './bookings-routing.module';
import { BookingListComponent } from './pages/booking-list/booking-list.component';


@NgModule({
  imports: [
    CommonModule,
    BookingsRoutingModule,
    BookingListComponent
  ]
})
export class BookingsModule { }
