import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

// Importing custom components
import { TopNavbar } from './components/top-navbar/top-navbar';
import { BottomDocks } from './components/bottom-docks/bottom-docks';

// Import the StatusBar from Capacitor
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html', // Template URL for AppComponent
  imports: [CommonModule, RouterOutlet, TopNavbar, BottomDocks], // Import dependencies
  styleUrls: ['./app.css'], // CSS file for styling AppComponent
})
export class App implements OnInit {
  protected title = 'ova-mobile';

  ngOnInit() {
    if (Capacitor.getPlatform() === 'android') {
      // Hide the status bar when the app starts
      StatusBar.setOverlaysWebView({ overlay: false });

      // Set the status bar style and background color if you want to customize it
      StatusBar.setStyle({
        style: 'dark' as Style, // Directly using 'dark' as the Style type
      });

      StatusBar.setBackgroundColor({
        color: '#000000', // Set the background color of the status bar (black in this case)
      });
    }
  }
}
