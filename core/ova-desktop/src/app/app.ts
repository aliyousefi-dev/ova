import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from './components/top-navbar/navbar.component';
import { BottomNavComponent } from './components/bottom-navbar/bottom-nav';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, BottomNavComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit {
  ngOnInit() {
    // Load the theme from localStorage
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Set a default theme if none is saved
      document.documentElement.setAttribute('data-theme', 'luxury');
    }
  }
}
