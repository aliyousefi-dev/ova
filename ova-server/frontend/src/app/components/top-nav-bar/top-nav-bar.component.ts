import { Component, Input, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { APIService } from '../../services/api.service';

@Component({
  selector: 'app-top-nav-bar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './top-nav-bar.component.html',
})
export class TopNavBarComponent implements OnInit {
  @Input() title = '';

  username = '';

  constructor(private apiService: APIService, private router: Router) {}

  ngOnInit() {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.username = storedUsername;
    } else {
      this.username = 'Guest'; // or empty string or some fallback
    }
  }

  onLogout() {
    this.apiService.logout().subscribe({
      next: () => {
        // Optionally clear username from localStorage on logout
        localStorage.removeItem('username');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }
}
