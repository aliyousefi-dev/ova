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

    // Subscribe to the shortcut service to listen for shortcut key presses
    this.shortcutService.shortcutPressed.subscribe((message: string) => {
      this.handleShortcut(message);
    });
  }

  // Custom logic to handle specific shortcuts
  handleShortcut(message: string) {
    switch (message) {
      case 'Ctrl+E pressed!':
        console.log('Handle Ctrl+E shortcut');
        break;
      case 'Ctrl+N pressed!':
        console.log('Handle Ctrl+N shortcut');
        break;
      case 'Ctrl+O pressed!':
        console.log('Handle Ctrl+O shortcut');
        break;
      default:
        console.log('No specific logic for this shortcut');
        break;
    }
  }
}
