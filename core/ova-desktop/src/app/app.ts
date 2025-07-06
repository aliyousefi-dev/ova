// app.ts
import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from './components/top-navbar/navbar.component';
import { BottomNavComponent } from './components/bottom-navbar/bottom-nav';
import { RouterOutlet } from '@angular/router';
import { ShortcutService } from './services/key-shortcut.service';
import { OvacliService } from './services/ovacli.service'; // Import the OvacliService

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, BottomNavComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit {
  constructor(
    private shortcutService: ShortcutService,
    private ovacliService: OvacliService // Inject the OvacliService
  ) {}

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

  // Handle Ctrl+E shortcut
  handleCtrlE() {
    console.log('Checking Ovacli version...');
    this.ovacliService
      .runOvacliVersion()
      .then((result) => {
        if (result.success) {
          console.log('Ovacli version:', result.output); // Display the version info
          alert(`Ovacli version: ${result.output}`); // You can show the version in an alert or update the UI
        } else {
          console.error('Error running Ovacli:', result.error); // Show the error message
          alert(`Error: ${result.error}`);
        }
      })
      .catch((error) => {
        console.error('Error running Ovacli:', error);
        alert(`Error: ${error.message}`);
      });
  }

  handleCtrlN() {
    // Add custom logic here for Ctrl+N
  }

  handleCtrlO() {
    // Add custom logic here for Ctrl+O
  }
}
