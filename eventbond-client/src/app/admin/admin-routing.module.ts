import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminEventListComponent } from './components/admin-event-list/admin-event-list.component';
import { AdminEventFormComponent } from './components/admin-event-form/admin-event-form.component';
import { adminGuard } from '../core/guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'events', pathMatch: 'full' },
      { path: 'events', component: AdminEventListComponent },
      { path: 'events/new', component: AdminEventFormComponent },
      { path: 'events/edit/:id', component: AdminEventFormComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
