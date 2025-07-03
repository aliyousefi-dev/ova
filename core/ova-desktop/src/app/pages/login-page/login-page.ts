import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Import Router service
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.html',
  standalone: true,
  imports: [CommonModule],
})
export class LoginPage {
  isSearching = false; // Flag to handle the button state

  constructor(private router: Router) {} // Inject the Router service

  // Method to navigate back
  goBack() {
    this.router.navigate(['/']); // You can change this to any specific route
    // Or you can use history back to go to the last visited route:
    // window.history.back();
  }

  // Method to simulate the search process
  searchLocalServer() {
    this.isSearching = true;

    setTimeout(() => {
      this.isSearching = false;
      alert('Search complete!');
    }, 2000);
  }
}
