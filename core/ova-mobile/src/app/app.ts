import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, ActivatedRoute, Router } from '@angular/router';

// Importing custom components
import { TopNavbar } from './components/top-navbar/top-navbar';
import { BottomDocks } from './components/bottom-docks/bottom-docks';

// Import the StatusBar from Capacitor
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [CommonModule, RouterOutlet, TopNavbar, BottomDocks],
  styleUrls: ['./app.css'],
})
export class App implements OnInit {
  protected title = 'ova-mobile';
  isLoginPage = false; // Flag to check if the current page is '/login'

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    if (Capacitor.getPlatform() === 'android') {
      StatusBar.setOverlaysWebView({ overlay: false });
      StatusBar.setStyle({
        style: 'dark' as Style,
      });
      StatusBar.setBackgroundColor({
        color: '#000000',
      });
    }

    // Listen for route changes to check if we're on the '/login' page
    this.router.events.subscribe((event) => {
      if (this.router.url === '/login') {
        this.isLoginPage = true;
      } else {
        this.isLoginPage = false;
      }
    });
  }
}
