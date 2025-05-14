import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router'; // Import ActivatedRoute
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service'; // Import AuthService

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  signinForm!: FormGroup;
  errorMessage: string | null = null;
  private returnUrl: string = '/events'; // Default return URL

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService, // Inject AuthService
    private route: ActivatedRoute // Inject ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    const queryParamReturnUrl = this.route.snapshot.queryParams['returnUrl'];
    const authServiceReturnUrl = this.authService.redirectUrl;
    console.log('SigninComponent ngOnInit - queryParamReturnUrl:', queryParamReturnUrl);
    console.log('SigninComponent ngOnInit - authServiceReturnUrl before reset:', authServiceReturnUrl);

    this.returnUrl = queryParamReturnUrl || authServiceReturnUrl || '/events';
    console.log('SigninComponent ngOnInit - effective returnUrl:', this.returnUrl);

    if (authServiceReturnUrl) {
        this.authService.redirectUrl = null; // Reset it after use from authService
        console.log('SigninComponent ngOnInit - authServiceReturnUrl after reset: null');
    }
  }

  onSubmit(): void {
    this.errorMessage = null;
    if (this.signinForm.valid) {
      const credentials = {
        email: this.signinForm.value.email,
        password: this.signinForm.value.password
      };
      console.log('SigninComponent onSubmit - Attempting signin with credentials:', credentials);
      this.authService.signin(credentials).subscribe({
        next: (user) => {
          console.log('SigninComponent onSubmit - Signin successful for user:', user);
          console.log('SigninComponent onSubmit - Using returnUrl for navigation:', this.returnUrl);
          if (user.role === 'admin') {
            console.log('SigninComponent onSubmit - Navigating to /admin for admin user.');
            this.router.navigate(['/admin']);
          } else {
            console.log('SigninComponent onSubmit - Navigating to user returnUrl:', this.returnUrl || '/events');
            this.router.navigate([this.returnUrl || '/events']);
          }
        },
        error: (err) => {
          this.errorMessage = err.message || 'Signin failed. Please check your credentials.';
          console.error('SigninComponent onSubmit - Signin failed:', err);
        }
      });
    } else {
      console.log('SigninComponent onSubmit - Form is invalid.');
    }
  }
}
