import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // Import RouterOutlet

@Component({
  selector: 'app-admin-dashboard',
  standalone: true, // Added standalone: true
  imports: [RouterOutlet], // Add RouterOutlet to imports
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {

}
