import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-mobile-dock',
  standalone: true,
  imports: [CommonModule, RouterModule, MatRippleModule],
  templateUrl: './mobile-dock.component.html',
})
export class MobileDockComponent {}
