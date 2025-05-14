import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingListComponent } from './pages/booking-list/booking-list.component';
import { authGuard } from '../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: BookingListComponent,
    canActivate: [authGuard] // Protect the bookings list
  }
  // Add more booking-related routes here if needed (e.g., booking detail)
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingsRoutingModule { }
