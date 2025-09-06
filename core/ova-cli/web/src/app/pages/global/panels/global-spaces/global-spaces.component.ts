import { Component } from '@angular/core';

@Component({
  selector: 'app-global-spaces',
  templateUrl: './global-spaces.component.html',
  standalone: true,
})
export class GlobalSpacesComponent {
  constructor() {}

  // Generate 100 items
  items = new Array(100).fill(0).map((_, index) => ({
    id: index + 1,
    name: `Channel Name ${index + 1}`,
    members: Math.floor(Math.random() * 500) + 50, // Random member count between 50 and 500
  }));
}
