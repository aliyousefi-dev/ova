import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mobile-dock',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mobile-dock.component.html',
})
export class MobileDockComponent {}
