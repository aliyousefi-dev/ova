import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs-bar',
  templateUrl: './tabs-bar.html'
})
export class TabsBar {
  
  constructor(private router: Router) {}

  // Method to handle navigation to different routes
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
