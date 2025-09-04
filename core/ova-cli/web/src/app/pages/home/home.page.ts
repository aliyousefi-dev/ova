import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GraphViewComponent } from '../../components/containers/graph-view/graph-view.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  imports: [CommonModule, GraphViewComponent],
})
export class HomePage {
  constructor(private router: Router) {}

  goTo(route: string) {
    this.router.navigate([route]);
  }
}
