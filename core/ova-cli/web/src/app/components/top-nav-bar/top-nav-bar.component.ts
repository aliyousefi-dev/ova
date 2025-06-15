import { Component, Input, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'app-top-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './top-nav-bar.component.html',
  styleUrls: ['./top-nav-bar.component.css'],
})
export class TopNavBarComponent implements OnInit {
  @Input() title = '';

  favoritesCount = 10;
  username = '';

  constructor(private authapi: AuthApiService, private router: Router) {}

  ngOnInit() {
    this.username = localStorage.getItem('username') || 'Guest';
  }

  onLogout() {
    this.authapi.logout().subscribe({
      next: () => {
        localStorage.removeItem('username');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }

  get userInitial(): string {
    return this.username ? this.username.charAt(0).toUpperCase() : '?';
  }
}
