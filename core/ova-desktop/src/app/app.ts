import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from './components/top-navbar/navbar.component';
import { BottomNavComponent } from './components/bottom-navbar/bottom-nav';
import { RouterOutlet } from '@angular/router';
import { ShortcutService } from './services/key-shortcut.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, BottomNavComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit {
  constructor(private shortcutService: ShortcutService) {}

  ngOnInit() {
    // Load the theme from localStorage
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Set a default theme if none is saved
      document.documentElement.setAttribute('data-theme', 'luxury');
    }

    // Subscribe to the individual shortcut events
    this.subscribeToShortcuts();
  }

  subscribeToShortcuts() {
    // Subscribe to each specific shortcut
    this.shortcutService.ctrlEPressed.subscribe(() => {
      console.log('Ctrl+E shortcut pressed');
      this.handleCtrlE();
    });

    this.shortcutService.ctrlNPressed.subscribe(() => {
      console.log('Ctrl+N shortcut pressed');
      this.handleCtrlN();
    });

    this.shortcutService.ctrlOPressed.subscribe(() => {
      console.log('Ctrl+O shortcut pressed');
      this.handleCtrlO();
    });
  }

  // Handle specific shortcuts
  handleCtrlE() {
    // Add custom logic here for Ctrl+E
  }

  handleCtrlN() {
    // Add custom logic here for Ctrl+N
  }

  handleCtrlO() {
    // Add custom logic here for Ctrl+O
  }
}
