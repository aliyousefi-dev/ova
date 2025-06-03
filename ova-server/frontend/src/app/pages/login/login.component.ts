import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { APIService } from '../../services/api.service';
import { LoginResponse } from '../../data-types/login-response';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: string | null = null;
  sessionId: string | null = null;

  constructor(private apiService: APIService) {}

  onSubmit() {
    this.error = null;
    if (!this.email || !this.password) {
      this.error = 'Both fields are required.';
      return;
    }

    this.apiService.login(this.email, this.password).subscribe({
      next: (res: LoginResponse) => {
        if (res.status === 'success') {
          this.sessionId = res.data.sessionId;
          this.error = null;
          alert('Login successful');
          console.log('Session ID:', this.sessionId);
          // No need to set cookie manually; backend should set it!
        } else {
          this.error = res.message || 'Login failed';
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'An error occurred during login.';
      },
    });
  }

  logout() {
    if (!this.sessionId) {
      alert('No active session');
      return;
    }
    this.apiService.logout().subscribe({
      next: (res) => {
        alert(res.message || 'Logged out');
        this.sessionId = null;
      },
      error: () => {
        alert('Logout failed');
      },
    });
  }
}
