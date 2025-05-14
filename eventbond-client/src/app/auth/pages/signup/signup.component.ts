import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service'; // Import AuthService

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService // Inject AuthService
  ) { }

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    this.errorMessage = null;
    if (this.signupForm.valid) {
      const { confirmPassword, ...userData } = this.signupForm.value;
      // The API expects: username, email, password, role
      // 'role' is added by the AuthService, defaulting to 'user'
      this.authService.signup(userData).subscribe({
        next: () => {
          // Navigate to signin page with a success message
          this.router.navigate(['/auth/signin'], { queryParams: { signupSuccess: 'true' } });
        },
        error: (err) => {
          this.errorMessage = err.message || 'Signup failed. Please try again.';
          console.error('Signup failed', err);
        }
      });
    }
  }
}
