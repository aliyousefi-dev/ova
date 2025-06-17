import { Component, OnInit, inject } from '@angular/core';
import {
  AuthApiService,
  UserProfile,
} from '../../services/api/auth-api.service';

import { TopNavBarComponent } from '../../components/top-nav-bar/top-nav-bar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [TopNavBarComponent],
  templateUrl: './profile.page.html',
})
export class ProfilePage implements OnInit {
  private authApi = inject(AuthApiService);

  username = '';
  roles: string[] = [];

  ngOnInit(): void {
    this.authApi.getProfile().subscribe({
      next: (profile: UserProfile) => {
        this.username = profile.username;
        this.roles = profile.roles;
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
      },
    });
  }
}
