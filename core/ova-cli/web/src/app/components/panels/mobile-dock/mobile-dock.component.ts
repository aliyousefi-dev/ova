import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-mobile-dock',
  standalone: true,
  imports: [CommonModule, RouterModule, MatRippleModule],
  templateUrl: './mobile-dock.component.html',
  styleUrls: ['./mobile-dock.component.css'],
})
export class MobileDockComponent {
  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  // Method to check if the current route is active
  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}
