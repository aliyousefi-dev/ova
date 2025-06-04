import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Import Router for navigation
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginResponse } from '../../data-types/responses';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  error: string | null = null;
  sessionId: string | null = null;

  constructor(private authapi: AuthApiService, private router: Router) {}

  onSubmit() {
    this.error = null;
    if (!this.username || !this.password) {
      this.error = 'Both fields are required.';
      return;
    }

    this.authapi.login(this.username, this.password).subscribe({
      next: (res: LoginResponse) => {
        if (res.status === 'success') {
          // Navigate to /home after successful login
          this.router.navigate(['/']);
        } else {
          this.error = res.message || 'Login failed';
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'An error occurred during login.';
      },
    });
  }
}
