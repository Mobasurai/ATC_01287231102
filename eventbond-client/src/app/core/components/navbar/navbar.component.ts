import { Component, OnInit, OnDestroy } from '@angular/core'; // Added OnDestroy
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service'; // Corrected path, imported User
import { Subscription } from 'rxjs'; // Imported Subscription

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy { // Implemented OnDestroy
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  private userSubscription: Subscription | undefined;
  private adminSubscription: Subscription | undefined;

  constructor(public authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe((user: User | null) => {
      this.isLoggedIn = !!user;
    });
    this.adminSubscription = this.authService.isAdmin$.subscribe((isAdminStatus: boolean) => {
      this.isAdmin = isAdminStatus;
    });
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void { // Added ngOnDestroy to unsubscribe
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.adminSubscription) {
      this.adminSubscription.unsubscribe();
    }
  }
}
