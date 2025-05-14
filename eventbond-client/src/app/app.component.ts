import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './core/components/navbar/navbar.component'; // Import NavbarComponent

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent], // Add NavbarComponent to imports
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'eventbond-client';
}
