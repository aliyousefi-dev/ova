import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mobile-drawer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mobile-drawer.component.html',
})
export class MobileDrawerComponent {
  closeDrawer() {
    const drawer = document.getElementById('my-drawer') as HTMLInputElement;
    if (drawer) {
      drawer.checked = false;
    }
  }
}
