import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule

import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminEventListComponent } from './components/admin-event-list/admin-event-list.component';
import { AdminEventFormComponent } from './components/admin-event-form/admin-event-form.component';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    AdminDashboardComponent, // Added: standalone component
    AdminEventListComponent, // Added: standalone component
    AdminEventFormComponent  // Added: standalone component
  ]
})
export class AdminModule { }
