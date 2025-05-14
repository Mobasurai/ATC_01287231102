import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: 'auth', 
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) 
  },
  {
    path: 'events',
    loadChildren: () => import('./events/events.module').then(m => m.EventsModule)
  },
  {
    path: 'bookings',
    loadChildren: () => import('./bookings/bookings.module').then(m => m.BookingsModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  { path: '', redirectTo: '/events', pathMatch: 'full' }, // Default route
  { path: '**', redirectTo: '/events' } // Wildcard route for 404, redirect to events or a dedicated NotFoundComponent
];
