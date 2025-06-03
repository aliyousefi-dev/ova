import { Component, Input } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { APIService } from '../../services/api.service';

@Component({
  selector: 'app-top-nav-bar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './top-nav-bar.component.html',
})
export class TopNavBarComponent {
  @Input() title = '';

  constructor(private apiService: APIService, private router: Router) {}

  onLogout() {
    this.apiService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }
}
