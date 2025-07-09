import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Import RouterModule for routing

@Component({
  selector: 'app-bottom-docks',
  standalone: true,
  templateUrl: './bottom-docks.html',
  imports: [CommonModule, RouterModule], // Import RouterModule to enable routerLink and routerLinkActive
  styles: [],
})
export class BottomDocks {}
