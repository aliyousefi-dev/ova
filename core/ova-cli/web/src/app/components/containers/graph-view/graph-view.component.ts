import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-graph-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './graph-view.component.html',
})
export class GraphViewComponent {
  sidebarOpen = true; // Initial state: sidebar is open
}
