import { Component } from '@angular/core';
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
export class App {
  openSettingsFromMenu() {
    // Logic to open settings from the menu
  }

  openSettings() {
    // Logic to open settings
  }
}
